import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Edit3, Trash2, UserPlus, CheckCircle, History, Users, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { AVATAR_COLORS } from './EditProfileModal';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'games'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit rating modal state
  const [editUser, setEditUser] = useState<any | null>(null);
  const [newRating, setNewRating] = useState<number>(1200);
  const [reason, setReason] = useState<string>('');

  // Add new student modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFullName, setAddFullName] = useState('');
  const [addGrade, setAddGrade] = useState('8-A');
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addInitialRating, setAddInitialRating] = useState(1200);
  const [addAvatarColor, setAddAvatarColor] = useState('amber');

  // Delete user confirmation state
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedGrade, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const [studentsData, gradesData] = await Promise.all([
          api.getAdminStudents(selectedGrade, search),
          api.getGrades(),
        ]);
        setStudents(studentsData);
        setGrades(gradesData);
      } else {
        const gamesData = await api.getAdminGames();
        setGames(gamesData);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !reason.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.adjustRating(editUser.id, newRating, reason);
      setSuccessMsg(res.message);
      setEditUser(null);
      setReason('');
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName.trim() || !addUsername.trim() || !addPassword.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.createStudent({
        fullName: addFullName.trim(),
        grade: addGrade,
        username: addUsername.trim(),
        password: addPassword.trim(),
        initialRating: addInitialRating,
        avatarColor: addAvatarColor,
      });

      setSuccessMsg(res.message || 'Yangi o‘quvchi muvaffaqiyatli qo‘shildi!');
      setIsAddModalOpen(false);
      setAddFullName('');
      setAddUsername('');
      setAddPassword('');
      setAddInitialRating(1200);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'O‘quvchini qo‘shishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!userToDelete) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.deleteUser(userToDelete.id);
      setSuccessMsg(res.message || 'O‘quvchi muvaffaqiyatli o‘chirildi.');
      setUserToDelete(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e: any) {
      setErrorMsg(e.message || 'O‘chirishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const gradeOptions = [
    '5-A', '5-B', '6-A', '6-B', '7-A', '7-B',
    '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Maktab Ma’muriyati & O‘qituvchi Boshqaruvi
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            O‘qituvchi Nazorat Paneli
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            O‘quvchilarni qo‘shish, o‘chirish, reytinglarni boshqarish va o‘yinlar auditi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setErrorMsg(null);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi O‘quvchi Qo‘shish</span>
          </button>

          <button
            onClick={loadData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-3 text-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'students'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>O‘quvchilar Boshqaruvi ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'games'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>O‘yinlar Jurnali (Audit)</span>
        </button>
      </div>

      {activeTab === 'students' ? (
        <div>
          {/* Filter and search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedGrade('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedGrade === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Barcha sinflar
              </button>
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedGrade === g
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {g}-sinf
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Ism yoki login..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Students table */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">O‘quvchi (F.I.O)</th>
                  <th className="px-5 py-3.5">Sinf</th>
                  <th className="px-5 py-3.5 text-center">Elo Reyting</th>
                  <th className="px-5 py-3.5 text-center">O‘yinlar</th>
                  <th className="px-5 py-3.5 text-center">Natijalar (Y/M/D)</th>
                  <th className="px-5 py-3.5 text-right">Boshqaruv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      O‘quvchilar ro‘yxati bo‘sh
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const avatarStyle = s.avatarColor && AVATAR_COLORS[s.avatarColor]
                      ? AVATAR_COLORS[s.avatarColor]
                      : AVATAR_COLORS.amber;

                    return (
                      <tr key={s.id} className="hover:bg-slate-700/30 transition">
                        <td className="px-5 py-4 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl ${avatarStyle.bg} border ${avatarStyle.border} flex items-center justify-center font-bold ${avatarStyle.text} text-sm flex-shrink-0`}
                            >
                              {s.fullName[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div>{s.fullName}</div>
                              <div className="text-xs text-slate-400 font-mono">@{s.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-slate-700 px-2.5 py-1 rounded-lg text-xs text-amber-300 font-mono">
                            {s.grade || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-mono font-bold text-amber-400 text-base">
                            {s.currentRating}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-slate-300 font-mono">
                          {s.gamesPlayed}
                        </td>
                        <td className="px-5 py-4 text-center text-xs">
                          <span className="text-emerald-400 font-bold">{s.wins}</span> /{' '}
                          <span className="text-red-400 font-bold">{s.losses}</span> /{' '}
                          <span className="text-slate-300 font-bold">{s.draws}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Reytingni sozlash */}
                            <button
                              onClick={() => {
                                setEditUser(s);
                                setNewRating(s.currentRating);
                                setReason('');
                              }}
                              title="Reytingni tahrirlash"
                              className="inline-flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-purple-500/30 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reyting</span>
                            </button>

                            {/* O'quvchini o'chirish */}
                            <button
                              onClick={() => setUserToDelete(s)}
                              title="O‘quvchini o‘chirish"
                              className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-500/30 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">O‘chirish</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Games audit tab */
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Oqlar</th>
                <th className="px-5 py-3.5">Qoralar</th>
                <th className="px-5 py-3.5 text-center">Holat / Natija</th>
                <th className="px-5 py-3.5 text-center">Tugatilish Sababi</th>
                <th className="px-5 py-3.5 text-right">Vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {games.map((g) => (
                <tr key={g.id} className="hover:bg-slate-700/30 transition">
                  <td className="px-5 py-4 font-semibold text-white">
                    {g.whitePlayer.fullName}{' '}
                    <span className="text-xs text-slate-400 font-mono">({g.whitePlayer.grade})</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white">
                    {g.blackPlayer.fullName}{' '}
                    <span className="text-xs text-slate-400 font-mono">({g.blackPlayer.grade})</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        g.result === 'WHITE_WON'
                          ? 'bg-amber-500/20 text-amber-300'
                          : g.result === 'BLACK_WON'
                          ? 'bg-slate-300/20 text-slate-200'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {g.result === 'WHITE_WON'
                        ? 'Oqlar yutdi'
                        : g.result === 'BLACK_WON'
                        ? 'Qoralar yutdi'
                        : 'Durang'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-xs text-slate-400">
                    {g.finishReason || 'Normal'}
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-slate-400 font-mono">
                    {new Date(g.createdAt).toLocaleString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Yangi O'quvchi Qo'shish Modali */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Yangi O‘quvchi Qo‘shish
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Admin tomonidan maktab o‘quvchisiga yangi hisob ochish
            </p>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">To‘liq Ism-Familiya</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Karimov"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sinfi</label>
                  <select
                    value={addGrade}
                    onChange={(e) => setAddGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}-sinf</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Boshlang‘ich Elo</label>
                  <input
                    type="number"
                    min="100"
                    max="3000"
                    value={addInitialRating}
                    onChange={(e) => setAddInitialRating(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Login (Username)</label>
                <input
                  type="text"
                  required
                  placeholder="sardor_8a"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Parol</label>
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Kamida 4 ta belgi"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Qo‘shilmoqda...' : 'O‘quvchini Qo‘shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. O'quvchini O'chirishni Tasdiqlash Modali */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border-2 border-red-500/50 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">O‘quvchini O‘chirish</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Haqiqatan ham <strong className="text-white">"{userToDelete.fullName}"</strong> (@{userToDelete.username}) ni
              tizimdan o‘chirib tashlamoqchimisiz?
              <br />
              <span className="text-red-400 text-[11px]">
                Diqqat: Uning barcha o‘yinlari va reyting tarixi ham qayta tiklanmaydigan holda o‘chiriladi!
              </span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteStudent}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-red-600/25 disabled:opacity-50"
              >
                {submitting ? 'O‘chirilmoqda...' : 'Ha, O‘chirilsin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reytingni sozlash modali */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reytingni Tahrirlash</h3>
            <p className="text-xs text-slate-400 mb-4">
              O‘quvchi: <span className="text-white font-semibold">{editUser.fullName}</span> ({editUser.grade}-sinf)
            </p>

            <form onSubmit={handleAdjustRating} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Yangi Elo Reyting</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="3000"
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  O‘zgartirish sababi (O‘qituvchi izohi)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Masalan: Maktab shashka musobaqasidagi g‘alaba uchun maxsus qo‘shimcha ball..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
