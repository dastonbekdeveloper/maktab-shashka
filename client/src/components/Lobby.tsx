import React, { useState } from 'react';
import { Plus, Swords, Play, Eye, Clock, Users, Flame } from 'lucide-react';

interface LobbyProps {
  rooms: any[];
  user: any | null;
  onCreateRoom: (options: { roomName: string; timeControlMinutes: number }) => void;
  onJoinRoom: (roomId: string) => void;
  onSpectateRoom: (roomId: string) => void;
  onOpenAuth: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  rooms,
  user,
  onCreateRoom,
  onJoinRoom,
  onSpectateRoom,
  onOpenAuth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [timeControl, setTimeControl] = useState(10);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    onCreateRoom({
      roomName: roomName || `${user.fullName} stoli`,
      timeControlMinutes: timeControl,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-700/80 p-6 sm:p-10 mb-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Flame className="w-3.5 h-3.5" />
            Maktablararo Rus Shashkasi
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            Tosh sur, Elo reytingingni oshir va maktab chempioni bo‘l!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Real vaqt rejimida sinfdoshlaringiz bilan shashka bahsiga kiring. Rasmiy qoidalar,
            majburiy tosh urish va jonli taymer bilan haqiqiy intellektual jang!
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/25 transition transform active:scale-95 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Yangi Stol Yaratish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white">Jonli O‘yin Stollari</h2>
            <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
              {rooms.length} ta faol stol
            </span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-300">Hozircha ochiq stollar yo‘q</h3>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              Birinchi bo‘lib o‘yin stolini yarating va do‘stlaringizni taklif qiling!
            </p>
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Stol ochish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const isWaiting = room.status === 'WAITING';
              return (
                <div
                  key={room.id}
                  className="bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                >
                  <div>
                    {/* Header: Room name & Time */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition truncate">
                        {room.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 bg-slate-900/80 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {room.timeControlMinutes} daq
                      </span>
                    </div>

                    {/* Players Info */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300 inline-block" />
                          <span className="font-semibold text-slate-200">{room.hostName}</span>
                        </div>
                        <span className="text-amber-400 font-mono font-bold">
                          {room.hostRating} Elo
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-stone-800 border border-stone-600 inline-block" />
                          <span className="font-semibold text-slate-200">
                            {room.guestName || (
                              <span className="text-slate-500 italic">Raqib kutilmoqda...</span>
                            )}
                          </span>
                        </div>
                        {room.guestRating && (
                          <span className="text-amber-400 font-mono font-bold">
                            {room.guestRating} Elo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isWaiting ? (
                      <button
                        onClick={() => {
                          if (!user) onOpenAuth();
                          else onJoinRoom(room.id);
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>O‘yinga Qo‘shilish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSpectateRoom(room.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 rounded-xl text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Tomosha qilish</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Yangi Stol Yaratish Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Yangi O‘yin Stoli Yaratish</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stol nomi</label>
                <input
                  type="text"
                  placeholder={`${user?.fullName} stoli`}
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Vaqt nazorati (Time control)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeControl(mins)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                        timeControl === mins
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'border-slate-700 bg-slate-900/40 text-slate-400'
                      }`}
                    >
                      <span>{mins} daqiqa</span>
                      <span className="text-[10px] opacity-60">
                        {mins === 3 ? 'Blitz' : mins === 5 ? 'Tezkor' : 'Klassik'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
                >
                  Stol Ochish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
