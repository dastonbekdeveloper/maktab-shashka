import React, { useState, useEffect } from 'react';
import { X, User, BookOpen, Palette, Lock, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface EditProfileModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export const AVATAR_COLORS: Record<string, { bg: string; border: string; text: string; name: string }> = {
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-400/50', text: 'text-amber-300', name: 'Oltin' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/50', text: 'text-emerald-300', name: 'Zumrad' },
  sky: { bg: 'bg-sky-500/20', border: 'border-sky-400/50', text: 'text-sky-300', name: 'Moviy' },
  purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/50', text: 'text-purple-300', name: 'Binafsha' },
  rose: { bg: 'bg-rose-500/20', border: 'border-rose-400/50', text: 'text-rose-300', name: 'Yoqut' },
  indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-400/50', text: 'text-indigo-300', name: 'Nilufar' },
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [grade, setGrade] = useState(user?.grade || '8-A');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'amber');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setGrade(user.grade || '8-A');
      setAvatarColor(user.avatarColor || 'amber');
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordChange(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.updateProfile({
        fullName: fullName.trim(),
        grade: user.role === 'STUDENT' ? grade : undefined,
        avatarColor,
        currentPassword: showPasswordChange ? currentPassword : undefined,
        newPassword: showPasswordChange ? newPassword : undefined,
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Profilni saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = [
    '5-A', '5-B', '6-A', '6-B', '7-A', '7-B',
    '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B'
  ];

  const activeColor = AVATAR_COLORS[avatarColor] || AVATAR_COLORS.amber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Profilni Sozlash
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Ism-familiya, sinf, avatar rangi yoki parolingizni yangilang
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview & Color Selection */}
          <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <div
              className={`w-14 h-14 rounded-2xl ${activeColor.bg} border-2 ${activeColor.border} flex items-center justify-center font-black text-2xl ${activeColor.text} shadow-lg transition-all`}
            >
              {fullName ? fullName[0].toUpperCase() : 'U'}
            </div>
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
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">To‘liq ism-familiyangiz</label>
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

          {/* Grade (only for students) */}
          {user.role === 'STUDENT' && (
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
          )}

          {/* Password Change Toggle */}
          <div className="pt-2 border-t border-slate-700/80">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{showPasswordChange ? 'Parolni o‘zgartirishni yopish' : 'Parolni o‘zgartirish'}</span>
            </button>

            {showPasswordChange && (
              <div className="space-y-3 mt-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Joriy parolingiz</label>
                  <input
                    type="password"
                    placeholder="Eski parolingiz"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Yangi parol</label>
                  <input
                    type="password"
                    minLength={4}
                    placeholder="Kamida 4 ta belgi"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
