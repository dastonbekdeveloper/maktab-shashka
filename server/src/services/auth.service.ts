import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'maktab-shashka-super-secret-key-2026';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  grade?: string | null;
}

export class AuthService {
  /**
   * 1. O'quvchi / Foydalanuvchini ro'yxatdan o'tkazish
   */
  public static async register(data: {
    username: string;
    password: string;
    fullName: string;
    grade?: string;
    avatarColor?: string;
  }) {
    const username = data.username.trim().toLowerCase();
    const fullName = data.fullName.trim();
    const password = data.password.trim();
    const grade = data.grade?.trim() || '8-A';

    if (!username || !password || !fullName) {
      throw new Error('Iltimos, barcha maydonlarni to‘ldiring.');
    }

    if (password.length < 4) {
      throw new Error('Parol kamida 4 ta belgidan iborat bo‘lishi kerak.');
    }

    // Login bandligini tekshirish
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      throw new Error('Ushbu login allaqachon band. Iltimos, boshqa login tanlang.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        role: 'STUDENT',
        grade,
        avatarColor: data.avatarColor || 'amber',
        currentRating: 1200,
      },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        grade: user.grade,
        avatarColor: user.avatarColor || 'amber',
        currentRating: user.currentRating,
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
      },
    };
  }

  /**
   * 2. Shaxsiy login va parol orqali tizimga kirish (har bir o'quvchi va admin uchun)
   */
  public static async login(usernameInput: string, passwordInput: string) {
    const username = usernameInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!username || !password) {
      throw new Error('Login va parolni kiriting.');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('Login yoki parol noto‘g‘ri.');
    }

    if (!user.password) {
      throw new Error('Ushbu hisob uchun parol o‘rnatilmagan.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Login yoki parol noto‘g‘ri.');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        grade: user.grade,
        avatarColor: user.avatarColor || 'amber',
        currentRating: user.currentRating,
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
      },
    };
  }

  /**
   * 3. Profilni sozlash va parolni o'zgartirish
   */
  public static async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      grade?: string;
      avatarColor?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('Foydalanuvchi topilmadi.');
    }

    const updateData: any = {};
    if (data.fullName && data.fullName.trim()) updateData.fullName = data.fullName.trim();
    if (data.grade && data.grade.trim() && user.role === 'STUDENT') updateData.grade = data.grade.trim();
    if (data.avatarColor) updateData.avatarColor = data.avatarColor;

    // Agar parolni o'zgartirayotgan bo'lsa
    if (data.newPassword && data.newPassword.trim()) {
      if (!data.currentPassword) {
        throw new Error('Parolni o‘zgartirish uchun avvalgi joriy parolingizni kiriting.');
      }
      if (user.password) {
        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
          throw new Error('Joriy parol noto‘g‘ri kiritildi.');
        }
      }
      if (data.newPassword.trim().length < 4) {
        throw new Error('Yangi parol kamida 4 ta belgidan iborat bo‘lishi kerak.');
      }
      updateData.password = await bcrypt.hash(data.newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      grade: updatedUser.grade,
      avatarColor: updatedUser.avatarColor || 'amber',
      currentRating: updatedUser.currentRating,
      gamesPlayed: updatedUser.gamesPlayed,
      wins: updatedUser.wins,
      losses: updatedUser.losses,
      draws: updatedUser.draws,
    };
  }

  public static generateToken(user: { id: string; username: string; role: string; grade?: string | null }): string {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      grade: user.grade,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '14d' });
  }

  public static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
