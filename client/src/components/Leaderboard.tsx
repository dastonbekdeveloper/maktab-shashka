import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Filter, Search, Award } from 'lucide-react';
import { api } from '../services/api';

interface LeaderboardProps {
  onSelectPlayer?: (playerId: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onSelectPlayer }) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedGrade]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [playersData, gradesData] = await Promise.all([
        api.getLeaderboard(selectedGrade),
        api.getGrades(),
      ]);
      setPlayers(playersData);
      setGrades(gradesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Maktab Shashka Reytingi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Maktab o‘quvchilarining rasmiy Elo reytingi va yutuqlar jadvali
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="O‘quvchi qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Grade filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setSelectedGrade('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedGrade === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Barcha Sinflar (Maktab)
        </button>
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedGrade === g
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {g}-sinf
          </button>
        ))}
      </div>

      {/* Top 3 Podium (agar maktab bo'yicha bo'lsa va 3 ta o'yinchi bo'lsa) */}
      {!loading && filteredPlayers.length >= 3 && selectedGrade === 'ALL' && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 max-w-2xl mx-auto items-end">
          {/* 2-o'rin (Kumush) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center transform translate-y-2 shadow-lg">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-300/20 text-slate-300 font-black text-xl flex items-center justify-center border-2 border-slate-300/50 mb-2">
              🥈
            </div>
            <div className="font-bold text-sm text-white truncate">{filteredPlayers[1].fullName}</div>
            <div className="text-xs text-slate-400">{filteredPlayers[1].grade}-sinf</div>
            <div className="mt-2 text-base font-black text-slate-200">{filteredPlayers[1].currentRating} Elo</div>
          </div>

          {/* 1-o'rin (Oltin) */}
          <div className="bg-gradient-to-b from-amber-500/20 to-slate-800 border-2 border-amber-500/50 rounded-2xl p-5 text-center shadow-xl shadow-amber-500/10">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-400/20 text-amber-400 font-black text-2xl flex items-center justify-center border-2 border-amber-400 mb-2 animate-bounce">
              🥇
            </div>
            <div className="font-bold text-base text-amber-200 truncate">{filteredPlayers[0].fullName}</div>
            <div className="text-xs text-amber-300/80">{filteredPlayers[0].grade}-sinf</div>
            <div className="mt-2 text-xl font-black text-amber-400">{filteredPlayers[0].currentRating} Elo</div>
          </div>

          {/* 3-o'rin (Bronza) */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center transform translate-y-4 shadow-lg">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-700/20 text-amber-600 font-black text-xl flex items-center justify-center border-2 border-amber-700/50 mb-2">
              🥉
            </div>
            <div className="font-bold text-sm text-white truncate">{filteredPlayers[2].fullName}</div>
            <div className="text-xs text-slate-400">{filteredPlayers[2].grade}-sinf</div>
            <div className="mt-2 text-base font-black text-amber-600">{filteredPlayers[2].currentRating} Elo</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">O‘rin</th>
                <th className="px-5 py-3.5">O‘quvchi</th>
                <th className="px-5 py-3.5">Sinf</th>
                <th className="px-5 py-3.5 text-center">Elo Reyting</th>
                <th className="px-5 py-3.5 text-center">O‘yinlar</th>
                <th className="px-5 py-3.5 text-center">Yutuq / Mag‘lubiyat</th>
                <th className="px-5 py-3.5 text-right">G‘alaba %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    O‘yinchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p, idx) => {
                  const winRate = p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPlayer && onSelectPlayer(p.id)}
                      className="hover:bg-slate-700/40 transition cursor-pointer"
                    >
                      <td className="px-5 py-4 font-bold text-slate-300">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{p.fullName}</span>
                          <span className="text-xs text-slate-400 font-mono">(@{p.username})</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-amber-300 font-mono">
                          {p.grade || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-mono font-black text-amber-400 text-base">
                          {p.currentRating}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-slate-300 font-mono">
                        {p.gamesPlayed}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-emerald-400 font-semibold">{p.wins}Y</span>{' '}
                        <span className="text-slate-400">/</span>{' '}
                        <span className="text-red-400 font-semibold">{p.losses}M</span>{' '}
                        <span className="text-slate-400">/</span>{' '}
                        <span className="text-slate-300 font-semibold">{p.draws}D</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-200">
                        {winRate}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
