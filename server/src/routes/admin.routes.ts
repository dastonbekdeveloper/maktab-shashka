import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticateJwt, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Barcha admin routelarni o'qituvchi yoki adminga cheklaymiz
router.use(authenticateJwt);
router.use(requireRole(['TEACHER', 'ADMIN']));

// 1. O'quvchilar to'liq ro'yxati
router.get('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { grade, search } = req.query;

    const where: any = { role: 'STUDENT' };
    if (grade && grade !== 'ALL') {
      where.grade = String(grade);
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const students = await prisma.user.findMany({
      where,
      orderBy: { currentRating: 'desc' },
      select: {
        id: true,
        username: true,
        fullName: true,
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

    res.json({ students });
  } catch (err: any) {
    res.status(500).json({ error: 'O‘quvchilar ro‘yxatini olishda xatolik' });
  }
});

// 2. Admin tomonidan yangi o'quvchi qo'shish
router.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, grade, username, password, initialRating, avatarColor } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'Ism-familiya, login va parol to‘ldirilishi shart.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ushbu login band. Iltimos, boshqa login yozing.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const rating = initialRating ? parseInt(initialRating, 10) : 1200;

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        password: hashedPassword,
        fullName: fullName.trim(),
        role: 'STUDENT',
        grade: grade || '8-A',
        avatarColor: avatarColor || 'amber',
        currentRating: rating,
      },
    });

    res.status(201).json({
      message: 'Yangi o‘quvchi muvaffaqiyatli qo‘shildi!',
      user: newUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'O‘quvchini qo‘shishda xatolik yuz berdi.' });
  }
});

// 3. Admin tomonidan foydalanuvchini o'chirish (va unga bog'liq barcha ma'lumotlarni tozalash)
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ error: 'Admin o‘z shaxsiy hisobini o‘chira olmaydi.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    }

    // Tranzaksiya orqali foydalanuvchiga tegishli barcha bog'liqliklarni tozalab o'chiramiz
    await prisma.$transaction([
      // 1. Foydalanuvchi qatnashgan o'yinlardagi harakatlar
      prisma.move.deleteMany({
        where: {
          OR: [
            { playerId: id },
            { game: { OR: [{ whitePlayerId: id }, { blackPlayerId: id }] } },
          ],
        },
      }),
      // 2. Reyting tarixi
      prisma.ratingHistory.deleteMany({
        where: {
          OR: [
            { userId: id },
            { game: { OR: [{ whitePlayerId: id }, { blackPlayerId: id }] } },
          ],
        },
      }),
      // 3. O'yinlar
      prisma.game.deleteMany({
        where: {
          OR: [{ whitePlayerId: id }, { blackPlayerId: id }],
        },
      }),
      // 4. Foydalanuvchini o'zi
      prisma.user.delete({
        where: { id },
      }),
    ]);

    res.json({ message: `${targetUser.fullName} muvaffaqiyatli o‘chirildi.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Foydalanuvchini o‘chirishda xatolik yuz berdi.' });
  }
});

// 4. O'yinlar monitoringi
router.get('/games', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const games = await prisma.game.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        whitePlayer: { select: { fullName: true, grade: true } },
        blackPlayer: { select: { fullName: true, grade: true } },
      },
    });

    res.json({ games });
  } catch (err: any) {
    res.status(500).json({ error: 'O‘yinlar auditini yuklashda xatolik' });
  }
});

// 5. Reytingni to'g'irlash (O'qituvchi huquqi)
router.post('/adjust-rating', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, newRating, reason } = req.body;

    if (!userId || newRating === undefined || !reason) {
      return res.status(400).json({ error: 'Foydalanuvchi, yangi reyting va sabab ko‘rsatilishi shart.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'O‘quvchi topilmadi' });
    }

    const ratingVal = parseInt(newRating, 10);
    const diff = ratingVal - user.currentRating;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { currentRating: ratingVal },
    });

    res.json({
      message: `Reyting muvaffaqiyatli o‘zgartirildi (${diff > 0 ? '+' : ''}${diff})`,
      user: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Reytingni tahrirlashda xatolik' });
  }
});

export default router;
