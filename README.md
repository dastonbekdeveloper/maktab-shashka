# 🏆 Maktab Shashka — Onlayn Shashka & Reyting Platformasi

Maktab o‘quvchilari va o‘qituvchilari uchun mo‘ljallangan, ichki **Elo reyting tizimiga** ega, real-time multiplayer rus shashkasi veb-platformasi.

---

## 🌟 Asosiy Imkoniyatlar

1. **O‘quvchilar uchun Tezkor va Parolsiz Kirish:**
   - O‘quvchilardan hech qanday qiyin login yoki parol talab qilinmaydi!
   - Shunchaki **Ism-familiya** va **Sinf** (`8-A`, `9-B`...) kiritiladi va darhol o‘yin boshlanadi.
2. **Shaxsiy Profilni Sozlash (Customization):**
   - Har bir o‘quvchi o‘z profilini erkin sozlashi mumkin:
     - Ism-familiyasini o‘zgartirish;
     - Sinfini yangilash;
     - Avatar rangini tanlash (Oltin, Zumrad, Moviy, Binafsha, Yoqut, Nilufar).
3. **Faqat Admin / O‘qituvchi Uchun Himoyalangan Kirish:**
   - O‘quvchilar adminga kirib ketmasligi uchun maxsus login va parol bilan himoyalangan.
   - **Login:** `admin`
   - **Parol:** `admin123`
   - O‘quvchilar reytingini nazorat qilish, tahrirlash va o‘yinlar auditini ko‘rish imkoniyati.
4. **Haqiqiy Rus Shashkasi Qoidalari (8x8):**
   - **Tosh urish majburiy:** Agar urish imkoni bo‘lsa, tinch yurishlar qat’iyan taqiqlanadi;
   - Oddiy toshlar oldinga yuradi, lekin **orqaga ham ura oladi**;
   - **Uchuvchi Damka (Flying King):** Diagonal bo‘ylab butun doskaga yuradi va dushmanning orqasidagi har qanday bo‘sh katakka qo‘na oladi;
   - **Ketma-ket urish (Combo capture):** Bitta tosh bilan kombinatsiyani oxirigacha urish shart.
5. **Dinamik Elo Reyting Tizimi:**
   - Boshlang‘ich reyting: **1200 Elo**;
   - Moslashuvchan K-faktor ($K=32$ yangi o‘quvchilarga, $K=24$ tajribalilarga, $K=16$ masterlarga);
   - O‘yin natijasiga ko‘ra har ikki o‘yinchining ballari atomik tranzaksiyada yangilanadi.
6. **Maktab Reyting Jadvali (Leaderboard):**
   - Maktab bo‘yicha umumiy va sinflar kesimida (`8-A`, `8-B`, `9-A`...) filtrlash;
   - 1-, 2-, 3-o‘rinlar uchun Oltin 🥇, Kumush 🥈 va Bronza 🥉 shohsupa (podium).
7. **Real-time Multiplayer Xonalar (Socket.io):**
   - Jonli stollar (Lobby);
   - Vaqt nazorati: 3 daqiqa (Blitz), 5 daqiqa (Tezkor), 10 daqiqa (Klassik);
   - Tomoshabin (Spectator) rejimi va xona chati.

---

## 🚀 Ishga Tushirish (Quick Start)

Loyihaning ildiz papkasidagi `dev.bat` faylini ikki marta bosing yoki terminalda:
```cmd
dev.bat
```

Brauzerda: **`http://localhost:3000`**

### 🔑 Tizimga Kirish:
* **O‘quvchilar:** "Kirish / Boshlash" tugmasini bosib, faqat ism-familiya va sinfini kiritadi (parol kerak emas).
* **Admin / O‘qituvchi:** Modalning pastidagi "Maktab Ma’muriyati & O‘qituvchi kirishi (Admin)" tugmasini bosib, `admin` / `admin123` bilan kiradi.
