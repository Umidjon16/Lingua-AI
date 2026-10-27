import { ReadingText } from '../types';

export const READING_TEXTS: ReadingText[] = [
  {
    id: 'read-en-1',
    language: 'en',
    level: 'A2',
    title: 'The Digital Revolution in Central Asia',
    category: 'Technology & Society',
    content: `Central Asia is experiencing rapid technological modernization. Young programmers in Uzbekistan are building innovative mobile applications and learning foreign languages to connect with global markets. Every day, thousands of students visit digital libraries and attend coding bootcamps. They understand that consistency and practical skills are the keys to a prosperous future. Technology is not merely a tool; it is an open gateway to limitless opportunities.`,
    uzbekSummary: "O'zbekiston va Markaziy Osiyoda yoshlar raqamli texnologiyalar va xorijiy tillarni o'rganish orqali xalqaro bozorlarga chiqmoqdalar.",
    glossary: {
      'experiencing': 'boshdan kechirmoqda',
      'rapid': 'tezkor, shiddatli',
      'innovative': 'innovatsion, yangicha',
      'libraries': 'kutubxonalar',
      'consistency': 'izchillik, muntazamlik',
      'prosperous': 'farovon, gullab-yashnagan',
      'gateway': 'darvoza, yo\'lak',
      'limitless': 'cheksiz'
    },
    comprehensionQuestions: [
      {
        questionUz: "Nima uchun yosh dasturchilar xorijiy tillarni o'rganmoqdalar?",
        options: [
          "Faqat sayohat qilish uchun",
          "Xalqaro bozorlar bilan bog'lanish uchun",
          "Kutubxonalarga bormaslik uchun",
          "Imtihonlardan o'tish uchungina"
        ],
        correctIndex: 1,
        explanationUz: "Matnda: '...learning foreign languages to connect with global markets' deb yozilgan."
      }
    ]
  },
  {
    id: 'read-en-2',
    language: 'en',
    level: 'B2',
    title: 'The Neuroscience of Bilingualism',
    category: 'Science & Education',
    content: `Neuroscientific research consistently demonstrates that learning a second language fundamentally reshapes neural pathways. Bilingual individuals exhibit superior executive functioning, enhanced problem-solving skills, and greater cognitive flexibility. When you switch between English and your mother tongue, your brain exercises attentional control, which helps stave off age-related cognitive decline. Consistent immersion and spaced repetition optimize these neurological adaptations.`,
    uzbekSummary: "Neyrobiologik tadqiqotlar ikkinchi tilni o'rganish miya faoliyatini, diqqatni boshqarishni va qarish bilan bog'liq kognitiv pasayishning oldini olishini isbotlamoqda.",
    glossary: {
      'demonstrates': 'ko\'rsatmoqda, isbotlamoqda',
      'neural': 'asab, neyron',
      'exhibit': 'namoyon qilmoq',
      'superior': 'ustun, a\'lo darajadagi',
      'executive': 'boshqaruvchi',
      'flexibility': 'moslashuvchanlik',
      'decline': 'pasayish, susayish',
      'immersion': 'til muhitiga sho\'ng\'ish'
    },
    comprehensionQuestions: [
      {
        questionUz: "Ikki tillilik (bilingualism) inson ongiga qanday foyda beradi?",
        options: [
          "Miyaning faoliyatini sekinlashtiradi",
          "Kognitiv moslashuvchanlik va diqqat nazoratini kuchaytiradi",
          "Insonni chalg'itadi",
          "Hech qanday farq qilmaydi"
        ],
        correctIndex: 1,
        explanationUz: "Matnda ikki tilli insonlar yuqori kognitiv moslashuvchanlikka (cognitive flexibility) ega ekanliklari qayd etilgan."
      }
    ]
  },
  {
    id: 'read-ru-1',
    language: 'ru',
    level: 'A2',
    title: 'Великий Шёлковый путь и Самарканд',
    category: 'История и Культура',
    content: `Самарканд — один из древнейших городов мира, расположенный в сердце Великого Шёлкового пути. На протяжении веков караваны купцов привозили сюда шёлк, фарфор, специи и редкие книги. Площадь Регистан восхищает туристов со всего мира своими великолепными медресе с голубыми куполами. Сегодня город объединяет богатую историю и современную культуру, сохраняя дух восточного гостеприимства.`,
    uzbekSummary: "Samarqand Buyuk Ipak yo'lining qadimiy durdonasi bo'lib, Registon maydoni va ko'k gumbazlari bilan butun dunyo sayyohlarini maftun etadi.",
    glossary: {
      'древнейших': 'eng qadimiy',
      'расположенный': 'joylashgan',
      'сердце': 'yurak, markaz',
      'купцов': 'savdogarlarning',
      'специи': 'ziravorlar',
      'восхищает': 'hayratga soladi',
      'куполами': 'gumbazlar bilan',
      'гостеприимства': 'mehmondo\'stlikning'
    },
    comprehensionQuestions: [
      {
        questionUz: "Registon maydoni sayyohlarni nima bilan hayratga soladi?",
        options: [
          "Zamonaviy osmono'par binolari bilan",
          "Ko'k gumbazli ajoyib madrasalari bilan",
          "Katta bozorlari bilan",
          "Dengiz sohillari bilan"
        ],
        correctIndex: 1,
        explanationUz: "Matnda: '...своими великолепными медресе с голубыми куполами' deyilgan."
      }
    ]
  }
];
