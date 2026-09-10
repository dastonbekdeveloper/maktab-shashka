import { Router, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateJwt, AuthenticatedRequest } from '../middleware/auth.middleware';
import { prisma } from '../db';

const router = Router();

// 1. Ro'yxatdan o'tish (Har bir o'quvchi o'ziga yangi login va parol ochadi)
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, grade, avatarColor } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Barcha maydonlarni to‘ldiring.' });
    }

    const result = await AuthService.register({
      username,
      password,
      fullName,
      grade,
      avatarColor,
    });

    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.' });
  }
});

// 2. Tizimga kirish (Har kim o'zining shaxsiy login va paroli bilan kiradi)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Login va parolni kiriting.' });
    }

    const result = await AuthService.login(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Kirishda xatolik yuz berdi.' });
  }
});

// 3. Profilni sozlash (Ism, sinf, avatar rangi, parolni yangilash)
router.put('/profile', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, grade, avatarColor, currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const updatedUser = await AuthService.updateProfile(userId, {
      fullName,
      grade,
      avatarColor,
      currentPassword,
      newPassword,
    });

    res.json({ message: 'Profil muvaffaqiyatli saqlandi', user: updatedUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Profilni saqlashda xatolik' });
  }
});

// 4. Joriy foydalanuvchini olish
router.get('/me', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        grade: true,
        avatarColor: true,
        currentRating: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        draws: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

export default router;
