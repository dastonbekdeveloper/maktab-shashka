import { Server, Socket } from 'socket.io';
import { CheckersEngine, MoveResult, PieceColor } from '../engine/checkers';
import { GameService } from '../services/game.service';

export interface RoomPlayer {
  userId: string;
  username: string;
  fullName: string;
  rating: number;
  socketId: string;
  color: PieceColor;
  remainingTimeMs: number;
  isConnected: boolean;
}

export interface ActiveRoom {
  id: string;
  name: string;
  whitePlayer: RoomPlayer;
  blackPlayer?: RoomPlayer;
  spectators: { socketId: string; username: string }[];
  engine: CheckersEngine;
  turn: PieceColor;
  forcedPieceIdx?: number;
  timeControlSeconds: number;
  incrementSeconds: number;
  lastMoveTimestamp: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  dbGameId?: string;
  timerInterval?: NodeJS.Timeout;
  disconnectTimeout?: NodeJS.Timeout;
  moveCount: number;
}

export class GameGateway {
  private io: Server;
  private rooms: Map<string, ActiveRoom> = new Map();
  private userToRoom: Map<string, string> = new Map(); // userId -> roomId

  constructor(io: Server) {
    this.io = io;
    this.init();
  }

  private init() {
    this.io.on('connection', (socket: Socket) => {
      // 1. Lobby so'rovlari
      socket.on('lobby:get_rooms', () => {
        socket.emit('lobby:room_list', this.getPublicRoomList());
      });

      // 2. Xona yaratish
      socket.on('room:create', (data: {
        userId: string;
        username: string;
        fullName: string;
        rating: number;
        roomName?: string;
        timeControlMinutes?: number;
        incrementSeconds?: number;
      }) => {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const timeMinutes = data.timeControlMinutes || 10;
        const initialMs = timeMinutes * 60 * 1000;

        const room: ActiveRoom = {
          id: roomId,
          name: data.roomName || `${data.fullName} stoli`,
          whitePlayer: {
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
            rating: data.rating,
            socketId: socket.id,
            color: 'WHITE',
            remainingTimeMs: initialMs,
            isConnected: true,
          },
          spectators: [],
          engine: new CheckersEngine(),
          turn: 'WHITE',
          timeControlSeconds: timeMinutes * 60,
          incrementSeconds: data.incrementSeconds || 0,
          lastMoveTimestamp: 0,
          status: 'WAITING',
          moveCount: 0,
        };

        this.rooms.set(roomId, room);
        this.userToRoom.set(data.userId, roomId);

        socket.join(roomId);
        socket.emit('room:created', { roomId, room: this.serializeRoom(room) });
        this.broadcastRoomList();
      });

      // 3. Xonaga qo'shilish (2-o'yinchi)
      socket.on('room:join', async (data: {
        roomId: string;
        userId: string;
        username: string;
        fullName: string;
        rating: number;
      }) => {
        const room = this.rooms.get(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Bunday o‘yin stoli topilmadi.' });
          return;
        }

        // Agar bu o'yinchi avval shu xonada o'ynagan bo'lsa (reconnect)
        if (room.whitePlayer.userId === data.userId) {
          room.whitePlayer.socketId = socket.id;
          room.whitePlayer.isConnected = true;
          if (room.disconnectTimeout) clearTimeout(room.disconnectTimeout);
          socket.join(data.roomId);
          socket.emit('room:joined', { roomId: data.roomId, room: this.serializeRoom(room) });
          this.io.to(data.roomId).emit('player:reconnected', { color: 'WHITE' });
          return;
        }

        if (room.blackPlayer && room.blackPlayer.userId === data.userId) {
          room.blackPlayer.socketId = socket.id;
          room.blackPlayer.isConnected = true;
          if (room.disconnectTimeout) clearTimeout(room.disconnectTimeout);
          socket.join(data.roomId);
          socket.emit('room:joined', { roomId: data.roomId, room: this.serializeRoom(room) });
          this.io.to(data.roomId).emit('player:reconnected', { color: 'BLACK' });
          return;
        }

        // Agar xona kutayotgan bo'lsa, qoralar sifatida qo'shilish
        if (room.status === 'WAITING') {
          room.blackPlayer = {
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
            rating: data.rating,
            socketId: socket.id,
            color: 'BLACK',
            remainingTimeMs: room.timeControlSeconds * 1000,
            isConnected: true,
          };
          room.status = 'PLAYING';
          room.lastMoveTimestamp = Date.now();
          this.userToRoom.set(data.userId, data.roomId);

          socket.join(data.roomId);

          // Ma'lumotlar bazasida o'yinni boshlash
          try {
            const dbGame = await GameService.createGame({
              whitePlayerId: room.whitePlayer.userId,
              blackPlayerId: room.blackPlayer.userId,
              timeControlSeconds: room.timeControlSeconds,
              incrementSeconds: room.incrementSeconds,
            });
            room.dbGameId = dbGame.id;
          } catch (err) {
            console.error('DB game create error:', err);
          }

          this.startRoomTimer(room);

          this.io.to(data.roomId).emit('game:started', {
            roomId: data.roomId,
            room: this.serializeRoom(room),
          });

          this.broadcastRoomList();
          return;
        }

        // Aks holda tomoshabin (Spectator) sifatida qo'shilish
        room.spectators.push({ socketId: socket.id, username: data.username });
        socket.join(data.roomId);
        socket.emit('room:joined_as_spectator', {
          roomId: data.roomId,
          room: this.serializeRoom(room),
        });
      });

      // 4. Harakat (Move)
      socket.on('game:move', async (data: { roomId: string; from: number; to: number }) => {
        const room = this.rooms.get(data.roomId);
        if (!room || room.status !== 'PLAYING') return;

        const currentActivePlayer = room.turn === 'WHITE' ? room.whitePlayer : room.blackPlayer;
        if (!currentActivePlayer || currentActivePlayer.socketId !== socket.id) {
          socket.emit('error', { message: 'Hozir sizning navbatingiz emas!' });
          return;
        }

        // Vaqtni yangilash
        const now = Date.now();
        const elapsed = now - room.lastMoveTimestamp;
        currentActivePlayer.remainingTimeMs = Math.max(0, currentActivePlayer.remainingTimeMs - elapsed);
        room.lastMoveTimestamp = now;

        // Vaqt tugaganini tekshirish
        if (currentActivePlayer.remainingTimeMs <= 0) {
          const winner = room.turn === 'WHITE' ? 'BLACK' : 'WHITE';
          await this.finishGame(room, winner, 'TIMEOUT');
          return;
        }

        // Shashta yurishini tekshirish
        const result: MoveResult = room.engine.makeMove(
          data.from,
          data.to,
          room.turn,
          room.forcedPieceIdx
        );

        if (!result.isValid) {
          socket.emit('move:rejected', {
            reason: result.errorReason,
            board: room.engine.getBoard(),
            turn: room.turn,
            forcedPieceIdx: room.forcedPieceIdx,
          });
          return;
        }

        room.moveCount++;

        // Bazada move qayd etish
        if (room.dbGameId) {
          GameService.recordMove({
            gameId: room.dbGameId,
            moveNumber: room.moveCount,
            playerId: currentActivePlayer.userId,
            fromPos: data.from,
            toPos: data.to,
            capturedPositions: result.capturedPositions,
            timeSpentMs: elapsed,
            fenAfter: JSON.stringify(room.engine.getBoard()),
          });
        }

        // Combo jump bormi?
        if (result.hasMoreJumps) {
          // Navbat almashmaydi, aynan shu tosh bilan urish davom etadi!
          room.forcedPieceIdx = data.to;
        } else {
          room.forcedPieceIdx = undefined;
          // Increment qo'shish
          currentActivePlayer.remainingTimeMs += room.incrementSeconds * 1000;
          // Navbatni raqibga o'tkazish
          room.turn = room.turn === 'WHITE' ? 'BLACK' : 'WHITE';
        }

        this.io.to(room.id).emit('game:updated', {
          board: room.engine.getBoard(),
          turn: room.turn,
          forcedPieceIdx: room.forcedPieceIdx,
          lastMove: {
            from: data.from,
            to: data.to,
            captured: result.capturedPositions,
            promoted: result.promotedToKing,
          },
          whiteRemainingMs: room.whitePlayer.remainingTimeMs,
          blackRemainingMs: room.blackPlayer?.remainingTimeMs ?? 0,
          pieceCounts: room.engine.getPieceCounts(),
        });

        // O'yin tugaganini tekshirish (pat yoki toshlar qolmagani)
        if (room.engine.isGameOver(room.turn)) {
          const winner = room.turn === 'WHITE' ? 'BLACK' : 'WHITE';
          await this.finishGame(room, winner, 'NO_MOVES_LEFT');
        }
      });

      // 5. Taslim bo'lish (Resign)
      socket.on('game:resign', async (data: { roomId: string }) => {
        const room = this.rooms.get(data.roomId);
        if (!room || room.status !== 'PLAYING') return;

        let winner: PieceColor | null = null;
        if (room.whitePlayer.socketId === socket.id) {
          winner = 'BLACK';
        } else if (room.blackPlayer?.socketId === socket.id) {
          winner = 'WHITE';
        }

        if (winner) {
          await this.finishGame(room, winner, 'RESIGNATION');
        }
      });

      // 6. Xona ichidagi chat xabari
      socket.on('chat:send', (data: { roomId: string; username: string; message: string }) => {
        if (!data.roomId || !data.message.trim()) return;
        this.io.to(data.roomId).emit('chat:received', {
          username: data.username,
          message: data.message.trim(),
          timestamp: new Date().toLocaleTimeString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      });

      // 7. Aloqa uzilishi (Disconnect)
      socket.on('disconnect', () => {
        for (const [roomId, room] of this.rooms.entries()) {
          let disconnectedColor: PieceColor | null = null;

          if (room.whitePlayer.socketId === socket.id) {
            room.whitePlayer.isConnected = false;
            disconnectedColor = 'WHITE';
          } else if (room.blackPlayer?.socketId === socket.id) {
            room.blackPlayer.isConnected = false;
            disconnectedColor = 'BLACK';
          }

          if (disconnectedColor && room.status === 'PLAYING') {
            this.io.to(roomId).emit('player:disconnected', {
              color: disconnectedColor,
              graceSeconds: 45,
            });

            // 45 soniya ichida qayta ulanmasa, texnik mag'lubiyat yoziladi
            room.disconnectTimeout = setTimeout(async () => {
              if (room.status === 'PLAYING') {
                const winner = disconnectedColor === 'WHITE' ? 'BLACK' : 'WHITE';
                await this.finishGame(room, winner, 'DISQUALIFIED');
              }
            }, 45000);
          } else if (room.status === 'WAITING' && room.whitePlayer.socketId === socket.id) {
            this.rooms.delete(roomId);
            this.broadcastRoomList();
          }
        }
      });
    });
  }

  private startRoomTimer(room: ActiveRoom) {
    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(async () => {
      if (room.status !== 'PLAYING') {
        clearInterval(room.timerInterval);
        return;
      }

      const now = Date.now();
      const elapsed = now - room.lastMoveTimestamp;
      const activePlayer = room.turn === 'WHITE' ? room.whitePlayer : room.blackPlayer;

      if (activePlayer) {
        const remaining = activePlayer.remainingTimeMs - elapsed;
        if (remaining <= 0) {
          const winner = room.turn === 'WHITE' ? 'BLACK' : 'WHITE';
          await this.finishGame(room, winner, 'TIMEOUT');
        }
      }
    }, 1000);
  }

  private async finishGame(room: ActiveRoom, winner: 'WHITE' | 'BLACK' | 'DRAW', reason: string) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.disconnectTimeout) clearTimeout(room.disconnectTimeout);
    room.status = 'FINISHED';

    let eloChanges = null;

    if (room.dbGameId) {
      try {
        const finishRes = await GameService.finishGame({
          gameId: room.dbGameId,
          winner,
          finishReason: reason,
          finalBoardState: JSON.stringify(room.engine.getBoard()),
        });
        if (finishRes) {
          eloChanges = finishRes.eloResult;
        }
      } catch (err) {
        console.error('Error saving finished game in DB:', err);
      }
    }

    this.io.to(room.id).emit('game:over', {
      winner,
      reason,
      eloChanges,
      board: room.engine.getBoard(),
    });

    this.broadcastRoomList();
  }

  private getPublicRoomList() {
    const list: any[] = [];
    for (const room of this.rooms.values()) {
      list.push({
        id: room.id,
        name: room.name,
        hostName: room.whitePlayer.fullName,
        hostRating: room.whitePlayer.rating,
        guestName: room.blackPlayer?.fullName,
        guestRating: room.blackPlayer?.rating,
        timeControlMinutes: Math.round(room.timeControlSeconds / 60),
        status: room.status,
      });
    }
    return list;
  }

  private broadcastRoomList() {
    this.io.emit('lobby:room_list', this.getPublicRoomList());
  }

  private serializeRoom(room: ActiveRoom) {
    return {
      id: room.id,
      name: room.name,
      status: room.status,
      whitePlayer: {
        userId: room.whitePlayer.userId,
        fullName: room.whitePlayer.fullName,
        rating: room.whitePlayer.rating,
        remainingTimeMs: room.whitePlayer.remainingTimeMs,
      },
      blackPlayer: room.blackPlayer ? {
        userId: room.blackPlayer.userId,
        fullName: room.blackPlayer.fullName,
        rating: room.blackPlayer.rating,
        remainingTimeMs: room.blackPlayer.remainingTimeMs,
      } : null,
      board: room.engine.getBoard(),
      turn: room.turn,
      forcedPieceIdx: room.forcedPieceIdx,
      pieceCounts: room.engine.getPieceCounts(),
    };
  }
}
