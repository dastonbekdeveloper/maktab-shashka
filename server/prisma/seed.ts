import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Ma’lumotlar bazasini tozalash va faqat Adminni o‘rnatish...');

  // Eski o'yinlar va foydalanuvchilarni tozalash
  await prisma.move.deleteMany({});
  await prisma.ratingHistory.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.user.deleteMany({});

  // Faqat yagona xavfsiz Admin hisobini yaratish
  const adminPass = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPass,
      fullName: 'Maktab Ma’muriyati (Admin)',
      role: 'ADMIN',
      grade: null,
      avatarColor: 'purple',
      currentRating: 1500,
    },
  });

  console.log('✅ Faqat Admin hisobi qoldirildi: login: admin / parol: admin123');
  console.log('✅ Boshqa barcha o‘quvchilar login-parolsiz o‘z ism-familiyasi bilan kirishi va profilini sozlashi mumkin.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
