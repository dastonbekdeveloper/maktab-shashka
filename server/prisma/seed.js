"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding initial school users...');
    // O'qituvchi va Admin
    const teacherPass = await bcryptjs_1.default.hash('123456', 10);
    const adminPass = await bcryptjs_1.default.hash('admin123', 10);
    const studentPass = await bcryptjs_1.default.hash('123456', 10);
    await prisma.user.upsert({
        where: { username: 'ustoz' },
        update: {},
        create: {
            username: 'ustoz',
            password: teacherPass,
            fullName: 'Dildora Rahimova (Informatika o‘qituvchisi)',
            role: 'TEACHER',
            grade: null,
            currentRating: 1500,
        },
    });
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPass,
            fullName: 'Maktab Ma’muriyati',
            role: 'ADMIN',
            grade: null,
            currentRating: 1500,
        },
    });
    // O'quvchilar
    const students = [
        { username: 'eldor', fullName: 'Eldor Aliyev', grade: '11-B', rating: 1820, wins: 45, losses: 10, draws: 5 },
        { username: 'sardor', fullName: 'Sardor Karimov', grade: '10-A', rating: 1750, wins: 38, losses: 12, draws: 4 },
        { username: 'bobur', fullName: 'Bobur Mirzayev', grade: '9-A', rating: 1680, wins: 30, losses: 15, draws: 3 },
        { username: 'jasur', fullName: 'Jasur Qodirov', grade: '8-B', rating: 1520, wins: 24, losses: 14, draws: 2 },
        { username: 'kamola', fullName: 'Kamola Saidova', grade: '10-A', rating: 1500, wins: 22, losses: 12, draws: 6 },
        { username: 'anvar', fullName: 'Anvar Normatov', grade: '8-A', rating: 1450, wins: 18, losses: 11, draws: 1 },
        { username: 'shaxzod', fullName: 'Shaxzod Rahmonov', grade: '9-A', rating: 1410, wins: 15, losses: 12, draws: 3 },
        { username: 'nodir', fullName: 'Nodirbek Yoqubov', grade: '8-A', rating: 1380, wins: 14, losses: 13, draws: 2 },
        { username: 'gulnoza', fullName: 'Gulnoza Oripova', grade: '11-B', rating: 1350, wins: 12, losses: 14, draws: 4 },
        { username: 'laylo', fullName: 'Laylo Toirova', grade: '9-A', rating: 1330, wins: 10, losses: 12, draws: 2 },
        { username: 'malika', fullName: 'Malika Xoliqova', grade: '8-A', rating: 1290, wins: 8, losses: 10, draws: 1 },
        { username: 'diyora', fullName: 'Diyora Rustamova', grade: '8-B', rating: 1240, wins: 6, losses: 8, draws: 2 },
        { username: 'muhammad', fullName: 'Muhammad Ali', grade: '8-A', rating: 1200, wins: 0, losses: 0, draws: 0 },
    ];
    for (const s of students) {
        await prisma.user.upsert({
            where: { username: s.username },
            update: {},
            create: {
                username: s.username,
                password: studentPass,
                fullName: s.fullName,
                role: 'STUDENT',
                grade: s.grade,
                currentRating: s.rating,
                gamesPlayed: s.wins + s.losses + s.draws,
                wins: s.wins,
                losses: s.losses,
                draws: s.draws,
            },
        });
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
