import { Lesson } from '../types';

export const COURSES_DATA: Lesson[] = [
  // ================= ENGLISH A1 =================
  {
    id: 'en-a1-1',
    language: 'en',
    level: 'A1',
    order: 1,
    topic: 'Grammar Basics',
    titleUz: '"To be" fe\'lining hozirgi zamoni (am, is, are)',
    titleOriginal: "Present Simple of 'To be'",
    descriptionUz: "Ingliz tilida 'to be' fe'li 'bo'lmoq', 'mavjud bo'lmoq' yoki shaxs/predmetning holatini, kasbini, yoshini ifodalash uchun ishlatiladi. O'zbek tilidagi 'men talabaman' kabi gaplarda fe'l qo'shimchasi bo'lsa, ingliz tilida albatta 'am, is, are' shakllaridan biri bo'lishi shart.",
    estimatedMinutes: 12,
    rulesUz: [
      "I olmoshi bilan 'am' ishlatiladi: I am (I'm).",
      "He, She, It birlik olmoshlari bilan 'is' ishlatiladi: He is, She is, It is.",
      "We, You, They ko'plik olmoshlari bilan 'are' ishlatiladi: We are, You are, They are.",
      "Inkor shaklida fe'ldan keyin 'not' qo'shiladi: I am not, He is not (isn't), They are not (aren't).",
      "So'roq shaklida 'am / is / are' egadan oldinga o'tadi: Are you a student? Is he at home?"
    ],
    examples: [
      { original: "I am a programmer.", uzbek: "Men dasturchiman.", note: "Kasb oldidan 'a/an' artikli qo'yiladi" },
      { original: "She is from Tashkent.", uzbek: "U Toshkentdan.", note: "'from' predlogi bilan" },
      { original: "They are very friendly.", uzbek: "Ular juda samimiy.", note: "Sifat oldidan ishlatilishi" },
      { original: "Is your brother at home?", uzbek: "Akangiz uydami?", note: "So'roq gap tuzilishi" }
    ],
    commonMistakesUz: [
      {
        wrong: "I student from Samarkand.",
        correct: "I am a student from Samarkand.",
        reasonUz: "O'zbek tilida 'men talabaman' deb aytiladi, lekin ingliz tilida 'am' bog'lovchi fe'li va 'a' noaniq artikli tushirib qoldirilmasligi shart."
      },
      {
        wrong: "He are my friend.",
        correct: "He is my friend.",
        reasonUz: "'He' (u - o'g'il bola) yakka shaxs bo'lgani uchun 'are' emas, 'is' qo'llaniladi."
      }
    ],
    questions: [
      {
        id: 'q-en-a1-1',
        type: 'choice',
        promptUz: "Gapdagi bo'sh joyga to'g'ri shaklni tanlang: 'My brother ___ an engineer.'",
        options: ['am', 'is', 'are', 'be'],
        correctAnswer: 'is',
        explanationUz: "'My brother' uchinchi shaxs birlik (He) bo'lgani sababli 'is' to'g'ri javobdir."
      },
      {
        id: 'q-en-a1-2',
        type: 'fill',
        promptUz: "Bo'sh o'ringa mos keluvchi 'to be' shaklini yozing: 'We ___ ready for the exam.'",
        correctAnswer: 'are',
        explanationUz: "'We' (biz) ko'plikda bo'lgani uchun 'are' ishlatiladi."
      },
      {
        id: 'q-en-a1-3',
        type: 'order',
        promptUz: "So'zlarni to'g'ri tartibda joylashtirib darak gap tuzing:",
        wordBank: ['She', 'very', 'is', 'happy', 'today'],
        correctAnswer: 'She is very happy today',
        explanationUz: "Ingliz tilida odatiy so'z tartibi: Ega (She) + Fe'l (is) + Ravish (very) + Sifat (happy) + Hol (today)."
      },
      {
        id: 'q-en-a1-4',
        type: 'correct',
        promptUz: "Xato gapni to'g'rilang: 'They is not at school.'",
        targetSentence: 'They is not at school.',
        correctAnswer: 'They are not at school.',
        explanationUz: "'They' ko'plik olmoshi 'are' talab qiladi, shuning uchun 'They are not at school' bo'ladi."
      }
    ]
  },
  {
    id: 'en-a1-2',
    language: 'en',
    level: 'A1',
    order: 2,
    topic: 'Tenses',
    titleUz: 'Present Simple - Oddiy hozirgi zamon',
    titleOriginal: 'Present Simple Tense',
    descriptionUz: "Present Simple zamoni har kuni takrorlanadigan odatlar, doimiy holatlar, ilmiy faktlar va umumiy haqiqatlarni ifodalash uchun qo'llaniladi. Masalan: 'Men har kuni kitob o'qiyman', 'Quyosh sharqdan chiqadi'.",
    estimatedMinutes: 15,
    rulesUz: [
      "I, You, We, They bilan fe'l o'zining asosiy (lug'aviy) shaklida keladi: I work, They live.",
      "He, She, It (3-shaxs birlik) bilan fe'lga -s yoki -es qo'shimchasi qo'shiladi: He works, She watches.",
      "Inkor shaklida 'do not' (don't) yoki 'does not' (doesn't) yordamchi fe'llari ishlatiladi.",
      "So'roq shaklida 'Do' yoki 'Does' egadan oldinga o'tadi: Do you speak English? Does she work here?",
      "Vaqt belgilari: always (doim), usually (odatda), often (tez-tez), sometimes (ba'zan), every day (har kuni)."
    ],
    examples: [
      { original: "I drink green tea every morning.", uzbek: "Men har kuni ertalab ko'k choy ichaman.", note: "Doimiy kundalik odat" },
      { original: "He works at a modern hospital.", uzbek: "U zamonaviy shifoxonada ishlaydi.", note: "Fe'lga -s qo'shilgan (He works)" },
      { original: "We don't watch TV on weekdays.", uzbek: "Biz ish kunlarida televizor ko'rmaymiz.", note: "Inkor gap" }
    ],
    commonMistakesUz: [
      {
        wrong: "He work in a bank.",
        correct: "He works in a bank.",
        reasonUz: "He/She/It olmoshlaridan keyin Present Simple'da fe'lga -s qo'shimchasini unutmaslik lozim."
      },
      {
        wrong: "Does she likes music?",
        correct: "Does she like music?",
        reasonUz: "'Does' yordamchi fe'li ishlatilganda, asosiy fe'ldagi -s qo'shimchasi tushib qoladi."
      }
    ],
    questions: [
      {
        id: 'q-en-a1-5',
        type: 'choice',
        promptUz: "To'g'ri variantni tanlang: 'My sister ___ English books every evening.'",
        options: ['read', 'reads', 'reading', 'is read'],
        correctAnswer: 'reads',
        explanationUz: "'My sister' (u - She) bo'lgani sababli fe'lga -s qo'shiladi: 'reads'."
      },
      {
        id: 'q-en-a1-6',
        type: 'fill',
        promptUz: "Inkor yordamchi fe'lini yozing: 'I ___ not like cold weather.'",
        correctAnswer: 'do',
        explanationUz: "'I' olmoshi bilan inkor yordamchi fe'li 'do' (do not / don't) qo'llanadi."
      }
    ]
  },

  // ================= ENGLISH A2 =================
  {
    id: 'en-a2-1',
    language: 'en',
    level: 'A2',
    order: 3,
    topic: 'Past Events',
    titleUz: 'Past Simple va Noto\'g\'ri fe\'llar',
    titleOriginal: 'Past Simple & Irregular Verbs',
    descriptionUz: "Past Simple zamoni o'tmishda ma'lum bir vaqtda boshlanib tugagan ish-harakatlarni ifodalaydi. To'g'ri fe'llarga -ed qo'shiladi, noto'g'ri fe'llar esa maxsus 2-shakl (V2)ga o'zgaradi (go -> went, see -> saw, buy -> bought).",
    estimatedMinutes: 18,
    rulesUz: [
      "To'g'ri fe'llarga -ed qo'shiladi: work -> worked, play -> played.",
      "Noto'g'ri fe'llarning 2-ustuni (Past Simple) yodlanishi shart: go -> went, take -> took, write -> wrote.",
      "Inkor va so'roq shaklida barcha shaxslar uchun 'did' / 'didn't' yordamchi fe'li ishlatiladi va asosiy fe'l 1-shaklga qaytadi.",
      "Vaqt signallari: yesterday (kecha), last week (o'tgan hafta), two days ago (ikki kun oldin), in 2020."
    ],
    examples: [
      { original: "We visited Samarkand last month.", uzbek: "Biz o'tgan oyda Samarqandni ziyorat qildik.", note: "To'g'ri fe'l: visit + ed" },
      { original: "She wrote an inspiring article yesterday.", uzbek: "U kecha ilhomlantiruvchi maqola yozdi.", note: "Noto'g'ri fe'l: write -> wrote" },
      { original: "Did you find your keys?", uzbek: "Kalitlaringizni topdingizmi?", note: "'Did' kelgani uchun fe'l 'find' shaklida" }
    ],
    commonMistakesUz: [
      {
        wrong: "I didn't saw him yesterday.",
        correct: "I didn't see him yesterday.",
        reasonUz: "'Didn't' yordamchi fe'lidan keyin doimo fe'lning 1-shakli (infinitive: see) keladi, ikkinchi shakl (saw) ishlatilmaydi."
      }
    ],
    questions: [
      {
        id: 'q-en-a2-1',
        type: 'choice',
        promptUz: "'Buy' fe'lining o'tgan zamon (Past Simple) shaklini tanlang:",
        options: ['buyed', 'bought', 'boated', 'buys'],
        correctAnswer: 'bought',
        explanationUz: "'Buy' noto'g'ri fe'l bo'lib, uning Past Simple shakli 'bought' hisoblanadi."
      },
      {
        id: 'q-en-a2-2',
        type: 'fill',
        promptUz: "Gapni to'ldiring: 'They ___ (go) to the library two hours ago.'",
        correctAnswer: 'went',
        explanationUz: "'Go' fe'lining o'tgan zamon shakli 'went'dir."
      }
    ]
  },

  // ================= ENGLISH B1 =================
  {
    id: 'en-b1-1',
    language: 'en',
    level: 'B1',
    order: 4,
    topic: 'Perfect Tenses',
    titleUz: 'Present Perfect - Natija va Hayotiy tajriba',
    titleOriginal: 'Present Perfect (have/has + V3)',
    descriptionUz: "Present Perfect zamoni o'tmishda sodir bo'lgan, ammo natijasi aynan hozirgi paytda ko'rinib turgan yoki insonning shu paytgacha bo'lgan umumiy tajribasini (hayotida biror ishni qilgan-qilmaganligini) ifodalaydi.",
    estimatedMinutes: 20,
    rulesUz: [
      "Tuzilishi: have / has + fe'lning 3-shakli (Past Participle / V3).",
      "I, You, We, They -> have finished / have eaten.",
      "He, She, It -> has finished / has eaten.",
      "Vaqt belgilari: already (allaqachon), just (hozirgina), yet (hali - inkor va so'roqda), ever (hech qachon - so'roqda), never (hech qachon - inkorda), since, for."
    ],
    examples: [
      { original: "I have already finished my homework.", uzbek: "Men uy vazifamni allaqachon tugatib bo'ldim.", note: "Hozirgi natija bor" },
      { original: "Have you ever been to London?", uzbek: "Siz hech Londonda bo'lganmisiz?", note: "Hayotiy tajriba so'ralmoqda" },
      { original: "She hasn't called me yet.", uzbek: "U hali menga qo'ng'iroq qilmadi.", note: "'yet' gap oxirida keladi" }
    ],
    commonMistakesUz: [
      {
        wrong: "I have seen him yesterday.",
        correct: "I saw him yesterday.",
        reasonUz: "'Yesterday', 'last year', 'in 2018' kabi aniq o'tgan vaqt ko'rsatilgan bo'lsa, Present Perfect emas, Past Simple ishlatiladi!"
      }
    ],
    questions: [
      {
        id: 'q-en-b1-1',
        type: 'choice',
        promptUz: "To'g'ri javobni tanlang: 'She ___ her passport, so she cannot travel.'",
        options: ['lost', 'has lost', 'is losing', 'loses'],
        correctAnswer: 'has lost',
        explanationUz: "Pasport yo'qolganining natijasi hozir mavjud (sayohat qila olmaydi), shuning uchun Present Perfect (has lost) to'g'ri."
      }
    ]
  },

  // ================= ENGLISH B2 =================
  {
    id: 'en-b2-1',
    language: 'en',
    level: 'B2',
    order: 5,
    topic: 'Advanced Grammar',
    titleUz: 'Conditionals - Shart mayllari (0, 1, 2, 3)',
    titleOriginal: 'Conditionals Overview',
    descriptionUz: "Shart ergash gaplar biror holat ro'y berishi uchun zarur shart va uning oqibatini bildiradi. Zero (umumiy qonuniyat), First (haqiqiy kelajak), Second (xayoliy hozirgi zamon), Third (o'tmishdagi afsus/o'zgarmas oqibat).",
    estimatedMinutes: 22,
    rulesUz: [
      "Zero Conditional (Faktlar): If + Present Simple, Present Simple. (If you heat water to 100°C, it boils.)",
      "First Conditional (Real kelajak): If + Present Simple, will + V1. (If it rains, we will stay home.)",
      "Second Conditional (Noaniq/Xayoliy hozirgi holat): If + Past Simple, would + V1. (If I had a million dollars, I would travel.)",
      "Third Conditional (O'tmishdagi afsus): If + Past Perfect (had + V3), would have + V3. (If I had studied harder, I would have passed.)"
    ],
    examples: [
      { original: "If you study consistently, you will achieve fluency.", uzbek: "Agar muntazam o'rgansangiz, ravonlikka erishasiz.", note: "1-turdagi real shart" },
      { original: "If I were you, I would take that opportunity.", uzbek: "Agar sizning o'rningizda bo'lganimda, bu imkoniyatdan foydalangan bo'lardim.", note: "2-turdagi xayoliy maslahat ('were' qo'llanadi)" }
    ],
    commonMistakesUz: [
      {
        wrong: "If it will rain tomorrow, I will stay at home.",
        correct: "If it rains tomorrow, I will stay at home.",
        reasonUz: "If qismida (shart ergash gapda) kelasi zamon (will) ishlatilmaydi, o'rniga Present Simple qo'yiladi."
      }
    ],
    questions: [
      {
        id: 'q-en-b2-1',
        type: 'choice',
        promptUz: "Gapni to'ldiring: 'If I ___ more free time, I would learn Spanish.'",
        options: ['have', 'had', 'will have', 'have had'],
        correctAnswer: 'had',
        explanationUz: "Bu Second Conditional (xayoliy holat: would learn), shuning uchun if-qismida Past Simple (had) bo'lishi kerak."
      }
    ]
  },

  // ================= RUSSIAN A1 =================
  {
    id: 'ru-a1-1',
    language: 'ru',
    level: 'A1',
    order: 1,
    topic: 'Основы грамматики',
    titleUz: 'Rus tilida otlarning jinsi (Род имён существительных)',
    titleOriginal: 'Род существительных (Мужской, Женский, Средний)',
    descriptionUz: "Rus tilida har bir ot uchta jinsdan (род) biriga tegishli bo'ladi: Erkak (Мужской), Ayol (Женский) yoki O'rta (Средний). Otning jinsini bilish juda muhim, chunki unga bog'lanadigan sifatlar, olmoshlar va o'tgan zamon fe'llari aynan jinsga qarab o'zgaradi.",
    estimatedMinutes: 14,
    rulesUz: [
      "Мужской род (Erkak jinsi): Undosh harf bilan tugaydi (стол, дом, брат, город) yoki -й (музей, чай). Olmoshi: Он.",
      "Женский род (Ayol jinsi): -а yoki -я harfi bilan tugaydi (книга, мама, сестра, песня). Olmoshi: Она.",
      "Средний род (O'rta jinsi): -о yoki -е harfi bilan tugaydi (окно, письмо, море, здание). Olmoshi: Оно.",
      "Yumshoq belgi (-ь) bilan tugaydigan so'zlar erkak yoki ayol jinsida bo'lishi mumkin va ularni lug'atdan eslab qolish kerak (словарь - м.р., тетрадь - ж.р.)."
    ],
    examples: [
      { original: "Это мой новый дом.", uzbek: "Bu mening yangi uyim.", note: "Дом - мужской род (undosh bilan tugagan)" },
      { original: "Это моя любимая книга.", uzbek: "Bu mening sevimli kitobim.", note: "Книга - женский род (-а bilan tugagan)" },
      { original: "Это большое окно.", uzbek: "Bu katta deraza.", note: "Окно - средний род (-о bilan tugagan)" }
    ],
    commonMistakesUz: [
      {
        wrong: "Мой сестра учится в университете.",
        correct: "Моя сестра учится в университете.",
        reasonUz: "'Сестра' ayol jinsida (женский род) bo'lgani uchun 'мой' emas, 'моя' bo'lishi shart."
      }
    ],
    questions: [
      {
        id: 'q-ru-a1-1',
        type: 'choice',
        promptUz: "'Письмо' (xat) so'zi qaysi jinsga mansub?",
        options: ['Мужской род', 'Женский род', 'Средний род'],
        correctAnswer: 'Средний род',
        explanationUz: "'Письмо' so'zi -о harfiga tugagani uchun Средний род (o'rta jins) hisoblanadi."
      },
      {
        id: 'q-ru-a1-2',
        type: 'fill',
        promptUz: "Tegishli olmoshni yozing (мой / моя / моё): 'Это ___ машина.'",
        correctAnswer: 'моя',
        explanationUz: "'Машина' -а harfiga tugagan (женский род), shuning uchun 'моя' ishlatiladi."
      }
    ]
  },

  // ================= RUSSIAN A2 =================
  {
    id: 'ru-a2-1',
    language: 'ru',
    level: 'A2',
    order: 2,
    topic: 'Падежи',
    titleUz: 'O\'rin-payt kelishigi (Предложный падеж - Где?)',
    titleOriginal: 'Предложный падеж (Где? О ком? О чём?)',
    descriptionUz: "Rus tilida 6 ta kelishik (падеж) mavjud. Predlojniy padej qayerda joylashganlikni ('Где?' so'rog'i) va kim/nima haqida gap ketayotganini ('О ком? О чём?') bildiradi. 'В' (ichida) va 'НА' (ustida/ochiq joyda) predloglari bilan birga qo'llaniladi.",
    estimatedMinutes: 16,
    rulesUz: [
      "Erkak va ayol jinsidagi so'zlarga odatda -е qo'shimchasi qo'shiladi: Ташкент -> в Ташкенте, школа -> в школе, стол -> на столе.",
      "-ия bilan tugagan ayol jinsidagi so'zlar -ии oladi: Россия -> в России, станция -> на станции.",
      "-ие bilan tugagan o'rta jins so'zlari ham -ии oladi: здание -> в здании.",
      "'В' odatda yopiq joylar, shahar va davlatlar uchun (в комнате, в Узбекистане); 'НА' ochiq joylar, tadbirlar yoki ko'cha uchun (на улице, на концерте, на работе)."
    ],
    examples: [
      { original: "Я живу в Ташкенте.", uzbek: "Men Toshkentda yashayman.", note: "Ташкент -> в Ташкенте" },
      { original: "Студенты сейчас на уроке.", uzbek: "Talabalar hozir darsda.", note: "На уроке (mashg'ulotda)" },
      { original: "Мы говорили о новом фильме.", uzbek: "Biz yangi film haqida gaplashdik.", note: "О ком? О чём?" }
    ],
    commonMistakesUz: [
      {
        wrong: "Я учусь в университет.",
        correct: "Я учусь в университете.",
        reasonUz: "'Qayerda?' so'rog'iga javob berganda Predlojniy padej qo'shimchasi (-е) qo'shilishi kerak."
      }
    ],
    questions: [
      {
        id: 'q-ru-a2-1',
        type: 'choice',
        promptUz: "To'g'ri shaklni tanlang: 'Они сейчас работают ___.'",
        options: ['в банк', 'в банке', 'на банка', 'в банку'],
        correctAnswer: 'в банке',
        explanationUz: "Bank binosi ichida ma'nosida 'в' predlogi va Predlojniy padej qo'shimchasi -е qo'shiladi: 'в банке'."
      }
    ]
  },

  // ================= RUSSIAN B1 =================
  {
    id: 'ru-b1-1',
    language: 'ru',
    level: 'B1',
    order: 3,
    topic: 'Глаголы движения',
    titleUz: 'Harakat fe\'llari: Идти va Ходить',
    titleOriginal: 'Глаголы движения без приставок',
    descriptionUz: "Rus tilida harakat fe'llari ikki turga bo'linadi: Bir yo'nalishli (Однонаправленные - aynan hozir bir tomonga ketayotgan) va Ko'p yo'nalishli (Многонаправленные - doimiy, har kuni borib-kelish yoki turli tomonga harakat).",
    estimatedMinutes: 20,
    rulesUz: [
      "Идти (я иду, ты идёшь...) - aynan hozir, bir tomonga piyoda ketayotganda ishlatiladi.",
      "Ходить (я хожу, ты ходишь...) - muntazam ravishda har kuni borib-kelish yoki odat uchun ishlatiladi.",
      "Taqqoslash: 'Сейчас я иду в университет' (Hozir ketyapman) vs 'Каждый день я хожу в университет' (Har kuni boraman)."
    ],
    examples: [
      { original: "Куда ты сейчас идёшь?", uzbek: "Hozir qayerga ketyapsan?", note: "Ayni damdagi bir tomonlama harakat" },
      { original: "Она часто ходит в театр.", uzbek: "U tez-tez teatrga borib turadi.", note: "Takrorlanuvchi harakat" }
    ],
    commonMistakesUz: [
      {
        wrong: "Я каждый день иду в школу.",
        correct: "Я каждый день хожу в школу.",
        reasonUz: "Har kuni takrorlanadigan doimiy harakat uchun 'идти' emas, 'ходить' ishlatiladi."
      }
    ],
    questions: [
      {
        id: 'q-ru-b1-1',
        type: 'choice',
        promptUz: "To'g'ri fe'lni tanlang: 'Посмотри в окно, дети ___ в парк.'",
        options: ['ходят', 'идут', 'ездить', 'пошли'],
        correctAnswer: 'идут',
        explanationUz: "Ayni damda ko'rinib turgan harakat bo'lgani sababli 'идут' (bir yo'nalishli) to'g'ri javobdir."
      }
    ]
  }
];
