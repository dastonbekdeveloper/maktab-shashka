import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { Leaderboard } from './components/Leaderboard';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { GameRoomView } from './components/GameRoomView';
import { api } from './services/api';
import { getSocket } from './services/socket';

export const App: React.FC = () => {
  const socket = getSocket();
  const [user, setUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<'lobby' | 'leaderboard' | 'admin' | 'profile'>('lobby');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Active game room
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    // 1. Foydalanuvchini tekshirish
    loadUser();

    // 2. Socket.io xonalarini tinglash
    socket.emit('lobby:get_rooms');

    socket.on('lobby:room_list', (roomList: any[]) => {
      setRooms(roomList);
    });

    socket.on('room:created', (data: { roomId: string; room: any }) => {
      setActiveRoom(data.room);
    });

    socket.on('room:joined', (data: { roomId: string; room: any }) => {
      setActiveRoom(data.room);
    });

    socket.on('room:joined_as_spectator', (data: { roomId: string; room: any }) => {
      setActiveRoom(data.room);
    });

    socket.on('error', (data: { message: string }) => {
      alert(data.message || 'Xatolik yuz berdi');
    });

    return () => {
      socket.off('lobby:room_list');
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:joined_as_spectator');
      socket.off('error');
    };
  }, [socket]);

  const loadUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveRoom(null);
  };

  const handleCreateRoom = (options: { roomName: string; timeControlMinutes: number }) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    socket.emit('room:create', {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      rating: user.currentRating,
      roomName: options.roomName,
      timeControlMinutes: options.timeControlMinutes,
    });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    socket.emit('room:join', {
      roomId,
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      rating: user.currentRating,
    });
  };

  const handleSpectateRoom = (roomId: string) => {
    socket.emit('room:join', {
      roomId,
      userId: user?.id || 'spectator',
      username: user?.username || 'Mehmon',
      fullName: user?.fullName || 'Kuzatuvchi',
      rating: user?.currentRating || 1200,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation */}
      <Navbar
        user={user}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'profile') {
            if (user) setSelectedProfileId(user.id);
            else setIsAuthOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeRoom ? (
          <GameRoomView
            room={activeRoom}
            user={user}
            onLeaveRoom={() => {
              setActiveRoom(null);
              socket.emit('lobby:get_rooms');
            }}
            onRefreshUser={loadUser}
          />
        ) : (
          <>
            {currentTab === 'lobby' && (
              <Lobby
                rooms={rooms}
                user={user}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onSpectateRoom={handleSpectateRoom}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentTab === 'leaderboard' && (
              <Leaderboard onSelectPlayer={(id) => setSelectedProfileId(id)} />
            )}

            {currentTab === 'admin' && <AdminPanel />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>Maktab Shashka © 2026 — Rus shashkasi va Elo reyting tizimi. Barcha huquqlar himoyalangan.</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          socket.emit('lobby:get_rooms');
        }}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        user={user}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
        }}
      />

      <ProfileModal
        userId={selectedProfileId}
        currentUserId={user?.id}
        onClose={() => setSelectedProfileId(null)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />
    </div>
  );
};

export default App;
