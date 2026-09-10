import React from 'react';
import { Trophy, Swords, ShieldCheck, User as UserIcon, LogOut, LogIn, School, Settings } from 'lucide-react';
import { AVATAR_COLORS } from './EditProfileModal';

interface NavbarProps {
  user: any | null;
  currentTab: 'lobby' | 'leaderboard' | 'admin' | 'profile';
  setCurrentTab: (tab: 'lobby' | 'leaderboard' | 'admin' | 'profile') => void;
  onOpenAuth: () => void;
  onOpenEditProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenEditProfile,
  onLogout,
}) => {
  const avatarStyle = user?.avatarColor && AVATAR_COLORS[user.avatarColor]
    ? AVATAR_COLORS[user.avatarColor]
    : AVATAR_COLORS.amber;

  return (
    <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setCurrentTab('lobby')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <School className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              MAKTAB SHASHKA
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-semibold">
              Onlayn Reyting Platformasi
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setCurrentTab('lobby')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentTab === 'lobby'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>O‘yinlar (Lobby)</span>
          </button>

          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              currentTab === 'leaderboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Reyting Jadvali</span>
          </button>

          {user && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentTab === 'admin'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'text-purple-300 hover:bg-purple-900/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>O‘qituvchi Paneli</span>
            </button>
          )}
        </nav>

        {/* User profile / Auth button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentTab('profile')}
                className="flex items-center space-x-2.5 bg-slate-700/70 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-600 transition"
              >
                <div
                  className={`w-8 h-8 rounded-full ${avatarStyle.bg} border ${avatarStyle.border} flex items-center justify-center font-bold ${avatarStyle.text} text-sm`}
                >
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                    {user.fullName}
                    {user.grade && (
                      <span className="text-[10px] bg-slate-600 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                        {user.grade}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <span>★ {user.currentRating} Elo</span>
                  </div>
                </div>
              </button>

              {/* Profilni sozlash tugmasi */}
              <button
                onClick={onOpenEditProfile}
                title="Profilni sozlash"
                className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition border border-slate-700"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                title="Tizimdan chiqish"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition transform active:scale-95 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Kirish / Boshlash</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
