# 🚀 Maktab Shashka Platformasini Online (Internetga) Bepul Chiqarish Qo‘llanmasi

Ushbu platforma (React + Node.js Express + Socket.io + Prisma) to‘liq yagona arxitekturaga keltirildi. Uni dunyoning istalgan nuqtasidagi o‘quvchilar va o‘qituvchilar telefon yoki kompyuter orqali ochishi uchun **100% bepul** internetga chiqarish mumkin.

---

## 🏆 Eng Yaxshi Bepul Platformalar Taqqoslovi

| Platforma | Server (Backend + WebSocket) | Ma’lumotlar Bazasi | Bepul Cheklovlar | Tavsiya |
|---|---|---|---|---|
| **Render.com** | ✅ Bepul (Web Service, WebSockets qo‘llab-quvvatlaydi) | ✅ Bepul PostgreSQL | 15 daqiqa harakatsizlikdan so‘ng uyqu rejimiga o‘tadi (keyingi kirishda 30 sekda uyg‘onadi) | **⭐️⭐️⭐️⭐️⭐️ 1-O‘RIN (Eng oson)** |
| **Koyeb.com** | ✅ Bepul (WebSockets bor, juda tez) | Neon.tech orqali | Bepul 1 ta xizmat (512MB RAM) | **⭐️⭐️⭐️⭐️ (Zo‘r alternativa)** |
| **Neon.tech** | — | ✅ Serverless PostgreSQL (Bir umr bepul, 0.5 GB) | Kredit karta so‘ramaydi | **⭐️⭐️⭐️⭐️⭐️ Baza uchun 1-o‘rin** |
| **Vercel + Render** | Frontend Vercel'da, Backend Render'da | Render/Neon | Ikkita joyda sozlash kerak | ⭐️⭐️⭐️ (Murakkabroq) |

---

## 🎯 1-TAVSIYA: Render.com orqali 100% Bepul Chiqarish (Hammasi Bitta Joyda)

Biz loyihani shunday moslashtirdik-ki, **Render.com** dagi bitta bepul xizmatning o‘zi ham Frontend (React), ham Backend (API), ham WebSocket (Shashka o‘yin stollari) ni birgalikda tarqatadi. Hech qanday CORS muammosi bo‘lmaydi!

### 1-Qadam: Loyihani GitHub'ga Yuklash
Agar loyihangiz hali GitHub'da bo‘lmasa:
1. [GitHub.com](https://github.com) saytiga kiring va yangi bo‘sh repository yarating (masalan: `maktab-shashka`).
2. Kompyuteringizdagi terminalda (shu loyiha papkasida) quyidagilarni bajaring:
```bash
git init
git add .
git commit -m "Maktab shashka platformasi tayyor"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/maktab-shashka.git
git push -u origin main
```

---

### 2-Qadam: Bepul Baza Ochish (Neon.tech — 1 daqiqada)
*(Render'ning o‘zida ham baza bor, lekin Neon.tech bir umr bepul va o‘chib ketmaydi)*
1. [Neon.tech](https://neon.tech) saytiga kiring (Google yoki GitHub orqali ro‘yxatdan o‘ting, karta so‘ramaydi).
2. Yangi loyiha yarating (masalan: `shashka-db`).
3. Dashboardda berilgan **Connection String** (URL) ni nusxalang:
   ```
   postgresql://foydalanuvchi:parol@ep-xyz.neon.tech/neondb?sslmode=require
   ```

---

### 3-Qadam: Render.com'da Bepul Saytni Ishga Tushirish
1. [Render.com](https://render.com) saytiga kiring va GitHub orqali tizimga kiring.
2. Dashboardda **"New +"** tugmasini bosing va **"Web Service"** ni tanlang.
3. GitHub'dagi `maktab-shashka` repositoryingizni tanlang.
4. Quyidagi sozlamalarni kiriting:
   - **Name:** `maktab-shashka` (yoki o‘zingiz istagan nom)
   - **Region:** Frankfurt (Germaniya — O‘zbekiston uchun eng yaqin va tezkor)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command:**
     ```bash
     cd server && npx prisma db push && npm start
     ```
   - **Instance Type:** **Free** ($0 / month)

5. **Environment Variables** (Muhit o‘zgaruvchilari) bo‘limiga quyidagilarni qo‘shing:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `maktab-shashka-super-maxfiy-kalit-2026`
   - `DATABASE_URL` = *(Neon.tech'dan nusxalangan PostgreSQL URL)*

6. **"Deploy Web Service"** tugmasini bosing!

---

### 4-Qadam: Tayyor! 🎉
Taxminan 2–3 daqiqadan so‘ng Render sizga bepul HTTPS domen beradi:
👉 **`https://maktab-shashka.onrender.com`**

Ushbu havolani maktab o‘quvchilari va o‘qituvchilariga ulashishingiz mumkin!
- O‘quvchilar telefon yoki kompyuter orqali o‘zlariga login-parol ochadi;
- Admin hisobi orqali (`admin` / `admin123`) panelga kirib boshqarish mumkin.

---

## 💡 Muhim Maslahat (Bepul tarif xususiyati):
Render.com bepul tarifida saytga 15 daqiqa davomida hech kim kirmasa, server vaqtincha uyqu holatiga o‘tadi (RAM tejash uchun). Keyingi safar biror kishi saytni ochsa, server 30–40 soniyada o‘z-o‘zidan uyg‘onadi va keyin juda tez ishlayveradi. Bu bepul xostinglar uchun odatiy holatdir.
