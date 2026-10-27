import { LibraryMemoryItem } from '../types';

export const STARTER_LIBRARY_MEMORY: LibraryMemoryItem[] = [
  // ================= ENGLISH KNOWLEDGE MEMORY =================
  {
    id: 'mem-en-1',
    language: 'en',
    category: 'phrasebook',
    topic: 'Kundalik muloqot va salomlashish',
    titleUz: "Ingliz tilida tabiiy salomlashish va hol-ahvol so'rash",
    original: 'Greetings & Small Talk',
    translationUz: "Salomlashish va qisqa samimiy suhbat iboralari",
    explanationUz: "Ingliz tilida faqat 'How are you?' emas, balki vaziyatga qarab 'How is it going?', 'What have you been up to?' kabi erkin iboralar juda keng qo'llaniladi. Javob berishda 'I am fine, thank you' o'rniga 'Doing well, thanks! How about you?' deyish tabiiyroq eshitiladi.",
    examples: [
      { original: "How is it going? — Pretty good, thanks!", uzbek: "Ishlar qalay? — Juda yaxshi, rahmat!" },
      { original: "Long time no see! What have you been up to?", uzbek: "Ko'rishmaganimizga ancha bo'ldi! Nimalar bilan bandsan?" },
      { original: "Have a good one! — You too!", uzbek: "Kuningiz xayrli o'tsin! — Sizga ham!" }
    ],
    tags: ['A1', 'A2', 'greetings', 'conversation', 'salom']
  },
  {
    id: 'mem-en-2',
    language: 'en',
    category: 'grammar_rule',
    topic: 'Zamonlar',
    titleUz: "Present Perfect va Past Simple o'rtasidagi asosiy farq",
    original: 'Present Perfect vs. Past Simple',
    translationUz: "Hozirgi tugallangan va Oddiy o'tgan zamon taqqosi",
    explanationUz: "Past Simple doimo o'tmishdagi ANIQ vaqt bilan bog'lanadi (yesterday, in 2021, two days ago, when I was young). Present Perfect esa ish-harakatning aynan QACHON bo'lganiga emas, balki hozirgi natijasiga yoki insonning umumiy hayotiy tajribasiga e'tibor qaratadi (already, just, ever, never, recently, yet).",
    examples: [
      { original: "I lost my keys yesterday. (Past Simple: Kecha yo'qotdim, hozir topgan ham bo'lishim mumkin)", uzbek: "Men kecha kalitlarimni yo'qotdim." },
      { original: "I have lost my keys! (Present Perfect: Kalitim yo'q, hozir uyga kira olmayapman, natija bor)", uzbek: "Kalitlarimni yo'qotib qo'ydim (hozir ham yo'q)!" },
      { original: "Have you ever tried Uzbek plov? — Yes, I tried it last year in Tashkent.", uzbek: "Hech o'zbek palovini tatib ko'rganmisiz? — Ha, o'tgan yili Toshkentda tatib ko'rganman." }
    ],
    tags: ['B1', 'grammar', 'tenses', 'perfect', 'past']
  },
  {
    id: 'mem-en-3',
    language: 'en',
    category: 'phrasebook',
    topic: 'Sayohat va Aeroport',
    titleUz: "Aeroport, Bojxona va Mehmonxona iboralari",
    original: 'Travel, Airport & Hotel Essentials',
    translationUz: "Sayohat, aeroport ro'yxatdan o'tishi va mehmonxona jumlalari",
    explanationUz: "Chet elga chiqqanda aeroportda 'boarding pass' (uchish taloni), 'baggage drop' (yuk topshirish), 'carry-on luggage' (qo'l yuki), va mehmonxonada 'check-in' / 'check-out' so'zlari eng zarur tushunchalardir.",
    examples: [
      { original: "I would like a window seat, please.", uzbek: "Iltimos, deraza tomonidagi o'rindiqni bersangiz." },
      { original: "What is the purpose of your visit? — I am here for tourism/business.", uzbek: "Tashrifingizdan maqsad nima? — Sayyohlik/Biznes maqsadida keldim." },
      { original: "Could I have a wake-up call at 7:00 AM tomorrow?", uzbek: "Ertaga ertalab soat 7:00 da uyg'otuvchi qo'ng'iroq qilib bera olasizmi?" }
    ],
    tags: ['A2', 'B1', 'travel', 'airport', 'hotel', 'sayohat']
  },
  {
    id: 'mem-en-4',
    language: 'en',
    category: 'idiom',
    topic: 'Frazeologizmlar va Idiomalar',
    titleUz: "Ingliz tilida eng ko'p uchraydigan 5 ta mashhur idioma",
    original: 'Top 5 Common English Idioms',
    translationUz: "Kundalik nutqdagi 5 ta muhim frazeologik ibora",
    explanationUz: "Idiomalarni so'zma-so'z tarjima qilib bo'lmaydi. Ularning ma'nosi ko'chma bo'lib, ona tilida so'zlashuvchilarning nutqini boyitadi.",
    examples: [
      { original: "Piece of cake — That exam was a piece of cake!", uzbek: "Juda oson, xamirdek oson — Bu imtihon suv ichgandek oson bo'ldi!" },
      { original: "Break a leg! — Good luck before a performance or exam.", uzbek: "Omad yor bo'lsin! (Sahna yoki sinovdan oldin aytiladi)" },
      { original: "Under the weather — I am feeling a bit under the weather today.", uzbek: "O'zini yomon his qilmoq, biroz betob bo'lmoq." },
      { original: "Hit the books — I have a big test tomorrow, time to hit the books.", uzbek: "Qattiq dars qilishga kirishmoq." },
      { original: "Cost an arm and a leg — Buying a brand new car costs an arm and a leg.", uzbek: "O'ta qimmat, otning kallasidek turadi." }
    ],
    tags: ['B1', 'B2', 'idioms', 'phrases', 'vocabulary']
  },
  {
    id: 'mem-en-5',
    language: 'en',
    category: 'dialogue',
    topic: 'Ish va Suhbat (Job Interview)',
    titleUz: "Ish intervyusida o'zini tanishtirish va tajribani aytish",
    original: 'Job Interview Dialogue & Self-Introduction',
    translationUz: "Ish suhbati savol-javoblari",
    explanationUz: "Intervyuda 'Tell me about yourself' savoliga oilangiz haqida emas, balki kasbiy yutuqlaringiz, qobiliyatlaringiz va kompaniyaga keltiradigan foydangiz haqida qisqa (2 daqiqalik) javob berish lozim.",
    examples: [
      { original: "What are your greatest strengths? — I am detail-oriented and adapt quickly to new tech.", uzbek: "Eng kuchli jihatlaringiz nima? — Men har bir detalga e'tiborliman va yangi texnologiyalarga tez moslashaman." },
      { original: "Where do you see yourself in five years?", uzbek: "5 yildan so'ng o'zingizni qayerda/qanday ko'rasiz?" },
      { original: "Why do you want to work with our company?", uzbek: "Nima uchun aynan bizning kompaniyada ishlashni xohlaysiz?" }
    ],
    tags: ['B2', 'C1', 'career', 'interview', 'business', 'ish']
  },

  // ================= RUSSIAN KNOWLEDGE MEMORY =================
  {
    id: 'mem-ru-1',
    language: 'ru',
    category: 'phrasebook',
    topic: 'Общение и вежливость',
    titleUz: "Rus tilida xushmuomalalik va kundalik iboralar",
    original: 'Вежливые фразы на каждый день',
    translationUz: "Xushmuomalalik va salomlashish jumlalari",
    explanationUz: "Rus tilida 'Вы' (sizlab) murojaat qilish juda katta hurmat belgisi hisoblanadi. Notanish insonlarga, do'konda yoki rasmiy idoralarda doimo 'Здравствуйте', 'Будьте добры', 'Подскажите, пожалуйста' iboralarini qo'llash tavsiya etiladi.",
    examples: [
      { original: "Будьте добры, подскажите, который час?", uzbek: "Iltimos, soat necha bo'lganini aytib yubora olmaysizmi?" },
      { original: "Очень приятно познакомиться! — Взаимно!", uzbek: "Tanishganimdan juda xursandman! — Men ham!" },
      { original: "Всего доброго! До скорой встречи!", uzbek: "Yaxshi qoling! Tez orada ko'rishguncha!" }
    ],
    tags: ['A1', 'A2', 'conversation', 'polite', 'muloqot']
  },
  {
    id: 'mem-ru-2',
    language: 'ru',
    category: 'grammar_rule',
    topic: 'Падежи (Kelishiklar)',
    titleUz: "Rus tilidagi 6 ta kelishikning savollari va mohiyati",
    original: '6 падежей русского языка: вопросы и значения',
    translationUz: "Rus tili kelishiklari tizimi",
    explanationUz: "Rus tilida har bir kelishik o'z so'rog'i va vazifasiga ega:\n1. Именительный (Кто? Что?) — Bosh kelishik (ega).\n2. Родительный (Кого? Чего? Откуда? Чей?) — Qaratqich/Yo'qlik (нет книги, из Ташкента).\n3. Дательный (Кому? Чему? Куда?) — Jo'nalish (дать другу, звонить маме).\n4. Винительный (Кого? Что? Куда?) — Tushum (читать книгу, видеть брата).\n5. Творительный (Кем? Чем? С кем?) — Qurol/Birgalik (писать ручкой, гулять с другом).\n6. Предложный (О ком? О чём? Где?) — O'rin-payt (думать о друге, жить в городе).",
    examples: [
      { original: "Я пишу письмо сестре. (Дательный: сестре — kimga?)", uzbek: "Men singlimga xat yozyapman." },
      { original: "У меня нет свободного времени. (Родительный: времени — nima yo'q?)", uzbek: "Menda bo'sh vaqt yo'q." },
      { original: "Мы гордимся нашими успехами. (Творительный: успехами — nima bilan faxrlanamiz?)", uzbek: "Biz muvaffaqiyatlarimiz bilan faxrlanamiz." }
    ],
    tags: ['A2', 'B1', 'grammar', 'cases', 'padej', 'kelishik']
  },
  {
    id: 'mem-ru-3',
    language: 'ru',
    category: 'grammar_rule',
    topic: 'Виды глаголов',
    titleUz: "Tugallangan va Tugallanmagan fe'llar (СВ vs НСВ)",
    original: 'Виды глаголов: Совершенный и Несовершенный',
    translationUz: "Fe'l ko'rinishlari farqi",
    explanationUz: "НСВ (Несовершенный вид - читать, делать, писать) ish-harakatning jarayonini, davomiyligini yoki har kuni takrorlanishini bildiradi. СВ (Совершенный вид - прочитать, сделать, написать) esa bir martalik, to'liq yakunlangan va natijaga ega harakatni ifodalaydi.",
    examples: [
      { original: "Я писал письмо два часа. (НСВ: jarayon, 2 soat yozdim)", uzbek: "Men ikki soat xat yozdim." },
      { original: "Я написал письмо и отправил его. (СВ: natija, yozib bo'ldim va jo'natdim)", uzbek: "Men xatni yozib bo'ldim va uni jo'natdim." },
      { original: "Каждый вечер он читает книгу. (НСВ: takrorlanuvchi odat)", uzbek: "Har oqshom u kitob o'qiydi." }
    ],
    tags: ['B1', 'B2', 'verbs', 'aspects', 'grammar']
  },
  {
    id: 'mem-ru-4',
    language: 'ru',
    category: 'phrasebook',
    topic: 'Город и Транспорт',
    titleUz: "Shahar, Metro, Taksi va yo'l so'rash iboralari",
    original: 'Город, транспорт и ориентирование',
    translationUz: "Transport va yo'l ko'rsatish jumlalari",
    explanationUz: "Shaharda harakatlanganda 'Как добраться до...?' (Qanday yetib olsa bo'ladi?), 'Остановите, пожалуйста, на следующей остановке' (Keyingi bekatda to'xtatib yuboring) kabi iboralar eng zaruridir.",
    examples: [
      { original: "Подскажите, как пройти к станции метро?", uzbek: "Metro bekatiga qanday borishni aytib yubora olmaysizmi?" },
      { original: "Сколько стоит проезд?", uzbek: "Yo'l haqi qancha turadi?" },
      { original: "Вам нужно повернуть направо на светофоре.", uzbek: "Svetoforda o'ng tomonga burilishingiz kerak." }
    ],
    tags: ['A1', 'A2', 'transport', 'city', 'shahar']
  }
];
