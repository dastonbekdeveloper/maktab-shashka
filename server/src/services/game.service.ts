import { prisma } from '../db';
import { EloRatingService, GameOutcome } from './elo.service';

export class GameService {
  /**
   * Yangi o'yinni ma'lumotlar bazasida ro'yxatga olish
   */
  public static async createGame(data: {
    whitePlayerId: string;
    blackPlayerId: string;
    timeControlSeconds: number;
    incrementSeconds?: number;
  }) {
    const whiteUser = await prisma.user.findUnique({ where: { id: data.whitePlayerId } });
    const blackUser = await prisma.user.findUnique({ where: { id: data.blackPlayerId } });

    if (!whiteUser || !blackUser) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    return await prisma.game.create({
      data: {
        whitePlayerId: data.whitePlayerId,
        blackPlayerId: data.blackPlayerId,
        status: 'ONGOING',
        timeControlSeconds: data.timeControlSeconds,
        incrementSeconds: data.incrementSeconds || 0,
        whiteRatingBefore: whiteUser.currentRating,
        blackRatingBefore: blackUser.currentRating,
        startedAt: new Date(),
      },
    });
  }

  /**
   * O'yin natijasini qayd etish va Elo reytingini tranzaksiyada yangilash
   */
  public static async finishGame(data: {
    gameId: string;
    winner: 'WHITE' | 'BLACK' | 'DRAW';
    finishReason: string;
    finalBoardState?: string;
  }) {
    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });

    if (!game || game.status === 'FINISHED') {
      return null;
    }

    const whiteUser = game.whitePlayer;
    const blackUser = game.blackPlayer;

    let outcomeA: GameOutcome = 'DRAW';
    let gameResult = 'DRAW';

    if (data.winner === 'WHITE') {
      outcomeA = 'WIN';
      gameResult = 'WHITE_WON';
    } else if (data.winner === 'BLACK') {
      outcomeA = 'LOSS';
      gameResult = 'BLACK_WON';
    }

    const eloResult = EloRatingService.calculate(
      { currentRating: whiteUser.currentRating, gamesPlayed: whiteUser.gamesPlayed },
      { currentRating: blackUser.currentRating, gamesPlayed: blackUser.gamesPlayed },
      outcomeA
    );

    // Atomik tranzaksiya orqali bazani yangilash
    const result = await prisma.$transaction([
      // 1. O'yinni yangilash
      prisma.game.update({
        where: { id: game.id },
        data: {
          status: 'FINISHED',
          result: gameResult,
          finishReason: data.finishReason,
          whiteRatingChange: eloResult.changeA,
          blackRatingChange: eloResult.changeB,
          finalBoardState: data.finalBoardState,
          finishedAt: new Date(),
        },
      }),
      // 2. Oqlar profilini yangilash
      prisma.user.update({
        where: { id: whiteUser.id },
        data: {
          currentRating: eloResult.newRatingA,
          gamesPlayed: { increment: 1 },
          wins: { increment: data.winner === 'WHITE' ? 1 : 0 },
          losses: { increment: data.winner === 'BLACK' ? 1 : 0 },
          draws: { increment: data.winner === 'DRAW' ? 1 : 0 },
        },
      }),
      // 3. Qoralar profilini yangilash
      prisma.user.update({
        where: { id: blackUser.id },
        data: {
          currentRating: eloResult.newRatingB,
          gamesPlayed: { increment: 1 },
          wins: { increment: data.winner === 'BLACK' ? 1 : 0 },
          losses: { increment: data.winner === 'WHITE' ? 1 : 0 },
          draws: { increment: data.winner === 'DRAW' ? 1 : 0 },
        },
      }),
      // 4. Rating history Oqlar
      prisma.ratingHistory.create({
        data: {
          userId: whiteUser.id,
          gameId: game.id,
          oldRating: whiteUser.currentRating,
          newRating: eloResult.newRatingA,
          change: eloResult.changeA,
        },
      }),
      // 5. Rating history Qoralar
      prisma.ratingHistory.create({
        data: {
          userId: blackUser.id,
          gameId: game.id,
          oldRating: blackUser.currentRating,
          newRating: eloResult.newRatingB,
          change: eloResult.changeB,
        },
      }),
    ]);

    return {
      game: result[0],
      eloResult,
    };
  }

  /**
   * Harakatni qayd etish
   */
  public static async recordMove(data: {
    gameId: string;
    moveNumber: number;
    playerId: string;
    fromPos: number;
    toPos: number;
    capturedPositions: number[];
    timeSpentMs: number;
    fenAfter: string;
  }) {
    try {
      await prisma.move.create({
        data: {
          gameId: data.gameId,
          moveNumber: data.moveNumber,
          playerId: data.playerId,
          fromPos: data.fromPos,
          toPos: data.toPos,
          capturedPositions: JSON.stringify(data.capturedPositions),
          timeSpentMs: data.timeSpentMs,
          fenAfter: data.fenAfter,
        },
      });
    } catch (e) {
      console.error('Error recording move:', e);
    }
  }
}
