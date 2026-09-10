import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// 1. Leaderboard (Top o'yinchilar, sinflar bo'yicha filter)
router.get('/leaderboard', async (req, res) => {
  try {
    const { grade } = req.query;

    const whereClause: any = {
      role: 'STUDENT',
      isActive: true,
    };

    if (grade && typeof grade === 'string' && grade !== 'ALL') {
      whereClause.grade = grade;
    }

    const topPlayers = await prisma.user.findMany({
      where: whereClause,
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
      },
      orderBy: {
        currentRating: 'desc',
      },
      take: 50,
    });

    res.json({ players: topPlayers });
  } catch (err: any) {
    res.status(500).json({ error: 'Leaderboardni yuklashda xatolik yuz berdi.' });
  }
});

// 2. Maktabdagi mavjud sinflar ro'yxatini olish
router.get('/grades', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT', grade: { not: null } },
      select: { grade: true },
      distinct: ['grade'],
      orderBy: { grade: 'asc' },
    });

    const grades = users.map((u) => u.grade).filter(Boolean);
    res.json({ grades });
  } catch (err: any) {
    res.status(500).json({ error: 'Sinflarni yuklashda xatolik yuz berdi.' });
  }
});

// 3. Foydalanuvchi profili va o'yinlar tarixi
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        grade: true,
        currentRating: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        draws: true,
        createdAt: true,
        ratingHistory: {
          orderBy: { createdAt: 'asc' },
          take: 30,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // O'yinlar tarixi
    const recentGames = await prisma.game.findMany({
      where: {
        OR: [{ whitePlayerId: id }, { blackPlayerId: id }],
        status: 'FINISHED',
      },
      include: {
        whitePlayer: { select: { fullName: true, username: true } },
        blackPlayer: { select: { fullName: true, username: true } },
      },
      orderBy: { finishedAt: 'desc' },
      take: 15,
    });

    res.json({ user, recentGames });
  } catch (err: any) {
    res.status(500).json({ error: 'Profil ma‘lumotlarini olishda xatolik' });
  }
});

export default router;
