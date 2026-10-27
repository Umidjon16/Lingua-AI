# Lingua AI — O'zbek Tilida Ingliz va Rus Tili Ta'lim Platformasi

**Lingua AI** — o'zbek tilida so'zlashuvchi foydalanuvchilar uchun ingliz va rus tillarini o'rganishga mo'ljallangan zamonaviy, to'liq funksional, ishlab chiqarishga yo'naltirilgan ta'lim platformasi.

---

## 🌟 Asosiy Xususiyatlar va Imkoniyatlar

1. **Dashboard (Boshqaruv Paneli):**
   - Foydalanuvchining real o'rganish statistikasi (har kuni bajarilgan darslar, yodlangan so'zlar, takrorlash zanjiri).
   - "Kunning yangi so'zi" va audio talaffuz.
   - Tavsiya etilgan navbatdagi darsga bir bosishda o'tish.

2. **Grammatika Kurslari (CEFR A1–C2):**
   - Ingliz va rus tillari uchun tuzilgan darslar xaritasi.
   - Har bir dars: o'zbek tilidagi qoidalar, misollar, keng tarqalgan xatolar va ularning sabablari.
   - 4 xil interaktiv mashq turi: ko'p tanlovli (Multiple Choice), bo'sh joyni to'ldirish (Fill-in-the-blank), so'zlardan gap tuzish (Sentence Ordering), gapni to'g'rilash (Sentence Correction).
   - Nima uchun javob to'g'ri yoki noto'g'ri ekanligini darhol o'zbekcha izohlab beruvchi tekshiruv.

3. **Oflayn Lug'at (Bilingual Offline Dictionary):**
   - Ikki tomonlama qidiruv: EN ⇄ UZ va RU ⇄ UZ.
   - Fonetik transkripsiya, so'z turkumi, sinonimlar va misol gaplar.
   - Browser Web Speech API orqali audio talaffuz.
   - So'zlarni bitta tugma orqali intervalli takrorlash kartochkalariga qo'shish.
   - JSON formatida to'liq lug'atni import va eksport qilish.

4. **AI Tyutor (Gemini 3.8 Flash):**
   - Server-side xavfsiz Gemini 3.8 Flash integratsiyasi (API kalit hech qachon brauzer kodida fosh bo'lmaydi).
   - Rejimlar: "Mavzuni tushuntir", "Suhbat amaliyoti", "Gapimni tekshir", "O'qish rejasi".
   - Barcha tushuntirishlar tushunarli o'zbek tilida.
   - Agar API kalit kiritilmagan bo'lsa, aniq sozlash ko'rsatmasi va metodik O'zbek tili demo repetitori faollashadi.

5. **Matn va Grammatika Tekshirgich (Writing Checker):**
   - Ingliz yoki rus tilidagi matnlarni imlo, grammatika, predloglar va uslub bo'yicha tahlil qilish.
   - Xatolarni qizil/yashil ranglarda ko'rsatish va o'zbekcha sababini tushuntirish.
   - To'g'rilangan variantni bir bosishda nusxalash va tarixga saqlash.

6. **Lug'at Trenajyori (SM-2 Spaced Repetition):**
   - SuperMemo-2 (SM-2) ilmiy algoritmi: "Again", "Hard", "Good", "Easy" baholari orqali optimal takrorlash kunini hisoblash.
   - Interaktiv kartochkalar (Flashcards).
   - Yozish amaliyoti (Typing practice).
   - So'z va tarjimani moslashtirish mini-o'yini (Matching cards).

7. **Testlar va Diagnostik Imtihonlar (Exams & Placement Test):**
   - CEFR darajani baholovchi 10–15 savolli diagnostik test.
   - Grammatika, lug'at boyligi va o'qib tushunish bo'yicha foizli tahlil.
   - Brauzer mikrofoni orqali nutq va talaffuzni tekshirish mashqi (Speech Recognition).

8. **Interaktiv Mutolaa Rejimi (Reading Lab):**
   - Ingliz va rus tillaridagi qiziqarli hikoya va maqolalar.
   - Matndagi istalgan so'zni bosganda darhol chiqadigan tarjima popoveri va kartochkaga qo'shish imkoni.
   - Shrift o'lchamini o'zgartirish (A-, A, A+) va o'zbekcha tushunish savollari.

9. **O'rganish Statistikasi va Tahlil:**
   - Kunlik faollik jurnali, sarflangan vaqt va takrorlangan so'zlar.
   - Barcha ma'lumotlarni to'liq JSON zaxira fayli sifatida yuklab olish va tozalash.

10. **Profil va Shaxsiy Sozlamalar:**
    - Mehmon rejimi (Guest Mode) — ro'yxatdan o'tmasdan to'liq oflayn ishlaydi.
    - O'rganish tili, joriy CEFR darajasi, kunlik maqsad, interfeys tili va Tungi rejim (Dark Mode).

11. **Administrator Boshqaruvi (Content Management):**
    - Yangi grammatika darslarini qo'shish va nashr etish.
    - Darslar to'plamini JSON sifatida eksport va import qilish.

---

## 🛠 Texnologiyalar To'plami (Tech Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion
- **Mahalliy Baza (Offline Database):** IndexedDB + Dexie.js
- **Server:** Express.js + Vite middleware (`tsx server.ts`)
- **Sun'iy Intellekt:** `@google/genai` TypeScript SDK (model: `gemini-3.8-flash`)
- **PWA:** Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`)

---

## 🚀 Ishga Tushirish va O'rnatish

### 1. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 2. Dasturni ishlab chiqish rejimida ishga tushirish (Port 3000):
```bash
npm run dev
```

### 3. Dasturni tekshirish va yig'ish (Build):
```bash
npm run lint
npm run build
```

### 4. Unit testlarni ishga tushirish:
```bash
npx --yes tsx --test src/utils/sm2.test.ts src/utils/cefr.test.ts src/utils/dictionarySearch.test.ts src/utils/librarySearch.test.ts
```

---

## 🔑 Muhit O'zgaruvchilari (.env)

Loyiha ildizidagi `.env` faylida quyidagi kalitlar sozlanadi:

```env
# Google Gemini API kaliti (Google AI Studio orqali olinadi)
GEMINI_API_KEY="AIzaSy..."

# Ilova joylashtirilgan URL manzili
APP_URL="http://localhost:3000"
```

*Eslatma: Agar `GEMINI_API_KEY` kiritilmasa, ilova buzilmaydi; u avtomatik ravishda O'zbek tili metodik Demo rejimiga o'tadi va barcha boshqa bo'limlar (darslar, lug'at, testlar, mutolaa, trenajyor) to'liq oflayn ishlayveradi.*

---

## 📋 Xususiyatlar Holati Jadvali (Feature Status)

| Xususiyat / Bo'lim | Holati | Oflayn ishlashi | Izoh |
| :--- | :---: | :---: | :--- |
| **Boshqaruv paneli (Dashboard)** | ✅ To'liq tayyor | Ha | Real IndexedDB statistikasi asosida |
| **Grammatika darslari (Courses)** | ✅ To'liq tayyor | Ha | A1-B2/C1 namunaviy o'quv dasturi, 4 xil mashq |
| **Oflayn Lug'at & Kutubxona (Dictionary & Library)** | ✅ To'liq tayyor | Ha | So'zlar bazasi, Bilimlar xotirasi, Onlayn qidiruv va saqlash |
| **AI Tyutor & Suhbatlar (Persistent Chat)** | ✅ To'liq tayyor | Ha (Xotira orqali) | Yozishmalar to'liq saqlanadi; oflayn xotiradan javob topadi |
| **Matn tekshirgich (Writing Checker)** | ✅ To'liq tayyor | Yo'q (Demo bor) | Chuqur tahlil va o'zbekcha izohlar |
| **Lug'at Trenajyori (Vocabulary SM-2)** | ✅ To'liq tayyor | Ha | SM-2 algoritmi, yozish, moslashtirish |
| **Testlar & Imtihonlar (Exams)** | ✅ To'liq tayyor | Ha | CEFR diagnostik test va Web Speech amaliyoti |
| **Mutolaa rejimi (Reading Lab)** | ✅ To'liq tayyor | Ha | So'zni bosganda bir zumda tarjima popoveri |
| **Statistika (Statistics)** | ✅ To'liq tayyor | Ha | O'rganish vaqti, foizlar va JSON eksport |
| **Profil va Sozlamalar** | ✅ To'liq tayyor | Ha | Mehmon rejimi, dark mode, CEFR maqsadlari |
| **PWA & Service Worker** | ✅ To'liq tayyor | Ha | Oflayn kesh va o'rnatish imkoniyati |
| **Admin paneli** | ✅ To'liq tayyor | Ha | Parol bilan himoyalangan kontent boshqaruvi |
