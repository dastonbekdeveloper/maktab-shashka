const API_BASE = (import.meta as any).env?.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.port === '3000' 
    ? 'http://localhost:4000/api' 
    : '/api');

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // 1. Ro'yxatdan o'tish (Har bir o'quvchi o'ziga shaxsiy login va parol yaratadi)
  async register(data: { username: string; password: string; fullName: string; grade?: string; avatarColor?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Ro‘yxatdan o‘tishda xatolik');
    return json;
  },

  // 2. Tizimga kirish (Shaxsiy login va parol orqali)
  async login(data: { username: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login yoki parol noto‘g‘ri');
    return json;
  },

  // 3. Profilni sozlash va parolni o'zgartirish
  async updateProfile(data: {
    fullName?: string;
    grade?: string;
    avatarColor?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Profilni saqlashda xatolik');
    return json;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user;
  },

  // Leaderboard
  async getLeaderboard(grade?: string) {
    const query = grade && grade !== 'ALL' ? `?grade=${encodeURIComponent(grade)}` : '';
    const res = await fetch(`${API_BASE}/users/leaderboard${query}`);
    const json = await res.json();
    return json.players || [];
  },

  async getGrades() {
    const res = await fetch(`${API_BASE}/users/grades`);
    const json = await res.json();
    return json.grades || [];
  },

  async getProfile(userId: string) {
    const res = await fetch(`${API_BASE}/users/profile/${userId}`);
    return await res.json();
  },

  // Admin: O'quvchilarni boshqarish
  async getAdminStudents(grade?: string, search?: string) {
    const params = new URLSearchParams();
    if (grade && grade !== 'ALL') params.append('grade', grade);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/admin/students?${params.toString()}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Yuklashda xatolik');
    return json.students || [];
  },

  async createStudent(data: {
    fullName: string;
    grade: string;
    username: string;
    password: string;
    initialRating?: number;
    avatarColor?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'O‘quvchini qo‘shishda xatolik');
    return json;
  },

  async deleteUser(userId: string) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Foydalanuvchini o‘chirishda xatolik');
    return json;
  },

  async getAdminGames() {
    const res = await fetch(`${API_BASE}/admin/games`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Yuklashda xatolik');
    return json.games || [];
  },

  async adjustRating(userId: string, newRating: number, reason: string) {
    const res = await fetch(`${API_BASE}/admin/adjust-rating`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, newRating, reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Reytingni tahrirlashda xatolik');
    return json;
  },
};
