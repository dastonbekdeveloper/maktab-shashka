import React, { useState, useEffect } from 'react';
import { X, Trophy, Swords, Calendar, TrendingUp, Settings } from 'lucide-react';
import { api } from '../services/api';
import { AVATAR_COLORS } from './EditProfileModal';

interface ProfileModalProps {
  userId: string | null;
  currentUserId?: string | null;
  onClose: () => void;
  onOpenEditProfile?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userId,
  currentUserId,
  onClose,
  onOpenEditProfile,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.getProfile(userId);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  const isSelf = currentUserId === userId;
  const avatarStyle = data?.user?.avatarColor && AVATAR_COLORS[data.user.avatarColor]
    ? AVATAR_COLORS[data.user.avatarColor]
    : AVATAR_COLORS.amber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Profil yuklanmoqda...</div>
        ) : !data || !data.user ? (
          <div className="py-12 text-center text-slate-400">Foydalanuvchi topilmadi</div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl ${avatarStyle.bg} border-2 ${avatarStyle.border} flex items-center justify-center font-black text-2xl ${avatarStyle.text} shadow-lg`}
                >
                  {data.user.fullName[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {data.user.fullName}
                    {data.user.grade && (
                      <span className="text-xs bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-mono">
                        {data.user.grade}-sinf
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    @{data.user.username} • {data.user.role === 'ADMIN' ? 'Administrator' : data.user.role === 'TEACHER' ? 'O‘qituvchi' : 'O‘quvchi'}
                  </div>
                </div>
              </div>

              {isSelf && onOpenEditProfile && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditProfile();
                  }}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-600 transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Sozlash</span>
                </button>
              )}
            </div>

            {/* Elo and Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <div className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Elo Reyting</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {data.user.currentRating}
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Jami O‘yinlar</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {data.user.gamesPlayed}
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-400">G‘alabalar</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {data.user.wins}
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-xl text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-400">G‘alaba %</div>
                <div className="text-lg font-black text-sky-400 font-mono mt-0.5">
                  {data.user.gamesPlayed > 0
                    ? Math.round((data.user.wins / data.user.gamesPlayed) * 100)
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Recent Games */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                Oxirgi O‘yinlar Tarixi
              </h3>
              {data.recentGames.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Hozircha o‘yinlar mavjud emas.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentGames.map((g: any) => {
                    const isWhite = g.whitePlayerId === data.user.id;
                    const opponent = isWhite ? g.blackPlayer : g.whitePlayer;
                    const isWin =
                      (isWhite && g.result === 'WHITE_WON') ||
                      (!isWhite && g.result === 'BLACK_WON');
                    const isDraw = g.result === 'DRAW';

                    return (
                      <div
                        key={g.id}
                        className="bg-slate-900/50 border border-slate-700/50 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isWin ? 'bg-emerald-400' : isDraw ? 'bg-blue-400' : 'bg-red-400'
                            }`}
                          />
                          <span className="text-white font-medium">vs {opponent.fullName}</span>
                          <span className="text-slate-500 font-mono">
                            ({isWhite ? 'Oqlar' : 'Qoralar'})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold ${
                              isWin
                                ? 'text-emerald-400'
                                : isDraw
                                ? 'text-blue-400'
                                : 'text-red-400'
                            }`}
                          >
                            {isWin ? 'G‘alaba' : isDraw ? 'Durang' : 'Mag‘lubiyat'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(g.finishedAt || g.createdAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
