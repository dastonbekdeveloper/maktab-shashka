import React, { useState } from 'react';
import { X, User, Lock, BookOpen, LogIn, UserPlus, Palette, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { AVATAR_COLORS } from './EditProfileModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('8-A');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState('amber');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.login({
        username: loginUsername.trim(),
        password: loginPassword.trim(),
      });

      localStorage.setItem('token', result.token);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login yoki parol noto‘g‘ri');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.register({
        fullName: fullName.trim(),
        grade,
        username: regUsername.trim(),
        password: regPassword.trim(),
        avatarColor,
      });

      localStorage.setItem('token', result.token);
      onSuccess(result.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = [
    '5-A', '5-B', '6-A', '6-B', '7-A', '7-B',
    '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex border-b border-slate-700 mb-6">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              isLoginTab
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Tizimga Kirish</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold transition flex items-center justify-center gap-2 border-b-2 ${
              !isLoginTab
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Ro‘yxatdan O‘tish</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {isLoginTab ? (
          /* 1. TIZIMGA KIRISH (LOGIN) */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Loginingiz</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masalan: sardor_8a yoki admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Parolingiz</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Kirilmoqda...' : 'Kirish'}</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Hisobingiz yo‘qmi? </span>
              <button
                type="button"
                onClick={() => { setIsLoginTab(false); setError(null); }}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Ro‘yxatdan o‘tish
              </button>
            </div>
          </form>
        ) : (
          /* 2. RO'YXATDAN O'TISH (REGISTER) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">To‘liq Ism-Familiyangiz</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Karimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sinfingiz</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition appearance-none cursor-pointer"
                >
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>{g}-sinf</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">O‘zingiz uchun yangi Login</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masalan: sardor_karimov"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">O‘zingiz uchun Parol</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Kamida 4 ta belgi"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Avatar Rangi
              </label>
              <div className="flex gap-2">
                {Object.entries(AVATAR_COLORS).map(([key, col]) => (
                  <button
                    key={key}
                    type="button"
                    title={col.name}
                    onClick={() => setAvatarColor(key)}
                    className={`w-6 h-6 rounded-full border-2 transition transform ${
                      avatarColor === key ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    } ${col.bg} ${col.border}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Yaratilmoqda...' : 'Ro‘yxatdan O‘tish'}</span>
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-slate-400">Allaqachon hisobingiz bormi? </span>
              <button
                type="button"
                onClick={() => { setIsLoginTab(true); setError(null); }}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Kirish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
