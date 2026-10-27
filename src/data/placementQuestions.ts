import { PlacementTestQuestion } from '../types';

export const PLACEMENT_QUESTIONS_EN: PlacementTestQuestion[] = [
  {
    id: 'pt-en-1',
    level: 'A1',
    category: 'grammar',
    question: "Where ___ you from?",
    options: ['is', 'are', 'am', 'be'],
    correctAnswer: 'are',
    explanationUz: "'You' olmoshi bilan 'are' shakli qo'llaniladi."
  },
  {
    id: 'pt-en-2',
    level: 'A1',
    category: 'vocabulary',
    question: "Which word means 'kitob' in English?",
    options: ['Pen', 'Book', 'Door', 'Desk'],
    correctAnswer: 'Book',
    explanationUz: "'Kitob' so'zining inglizcha tarjimasi 'Book'."
  },
  {
    id: 'pt-en-3',
    level: 'A2',
    category: 'grammar',
    question: "They ___ soccer yesterday afternoon.",
    options: ['play', 'played', 'playing', 'plays'],
    correctAnswer: 'played',
    explanationUz: "'Yesterday' ko'rsatilgani sababli fe'l o'tgan zamonda (played) bo'lishi kerak."
  },
  {
    id: 'pt-en-4',
    level: 'A2',
    category: 'reading',
    question: "Read: 'Sarah usually wakes up at 7:00 AM, but on Sundays she sleeps until 9:00 AM.' When does she wake up on Sunday?",
    options: ['At 7:00 AM', 'At 9:00 AM', 'At 8:00 AM', 'She does not wake up'],
    correctAnswer: 'At 9:00 AM',
    explanationUz: "Matnda yakshanba kuni soat 9:00 gacha uxlashi aytilgan."
  },
  {
    id: 'pt-en-5',
    level: 'B1',
    category: 'grammar',
    question: "I haven't seen my cousin ___ five years.",
    options: ['since', 'for', 'during', 'from'],
    correctAnswer: 'for',
    explanationUz: "Vaqt davomiyligi (davr: 5 yil) berilganda 'for' ishlatiladi."
  },
  {
    id: 'pt-en-6',
    level: 'B1',
    category: 'vocabulary',
    question: "Select the closest synonym for 'expand':",
    options: ['Reduce', 'Grow or increase', 'Stop', 'Damage'],
    correctAnswer: 'Grow or increase',
    explanationUz: "'Expand' kengaytirmoq, kattalashtirmoq (grow or increase) degan ma'noni anglatadi."
  },
  {
    id: 'pt-en-7',
    level: 'B2',
    category: 'grammar',
    question: "If she had arrived earlier, we ___ the train.",
    options: ['will catch', 'would catch', 'would have caught', 'caught'],
    correctAnswer: 'would have caught',
    explanationUz: "Bu Third Conditional (If + had + V3 -> would have + V3)."
  },
  {
    id: 'pt-en-8',
    level: 'B2',
    category: 'reading',
    question: "Read: 'Despite the economic slowdown, the tech firm reported a 20% surge in annual revenue, driven by AI services.' What caused the growth?",
    options: ['The economic slowdown', 'AI services', 'Staff reduction', 'Government grants'],
    correctAnswer: 'AI services',
    explanationUz: "Matnda o'sish sun'iy intellekt xizmatlari ('driven by AI services') hisobiga bo'lgani aytilgan."
  },
  {
    id: 'pt-en-9',
    level: 'C1',
    category: 'grammar',
    question: "Seldom ___ such remarkable dedication among junior researchers.",
    options: ['we saw', 'have we seen', 'we have seen', 'did we saw'],
    correctAnswer: 'have we seen',
    explanationUz: "'Seldom' salbiy inkor so'zi gap boshida kelganda inversiya (yordamchi fe'l + ega) yasaladi."
  },
  {
    id: 'pt-en-10',
    level: 'C2',
    category: 'vocabulary',
    question: "What does the idiom 'to throw caution to the wind' mean?",
    options: ['To become extremely nervous', 'To take a great risk without worrying about consequences', 'To predict bad weather', 'To save money for hard times'],
    correctAnswer: 'To take a great risk without worrying about consequences',
    explanationUz: "Ushbu ibora xavf-xatarga qaramasdan tavakkal qilish ma'nosini bildiradi."
  }
];

export const PLACEMENT_QUESTIONS_RU: PlacementTestQuestion[] = [
  {
    id: 'pt-ru-1',
    level: 'A1',
    category: 'grammar',
    question: "Как вас ___?",
    options: ['зовут', 'имя', 'фамилия', 'звался'],
    correctAnswer: 'зовут',
    explanationUz: "Ismni so'rashda 'Как вас зовут?' iborasi qo'llaniladi."
  },
  {
    id: 'pt-ru-2',
    level: 'A1',
    category: 'vocabulary',
    question: "Выберите перевод слова 'kitob' на русский язык:",
    options: ['Тетрадь', 'Книга', 'Ручка', 'Стол'],
    correctAnswer: 'Книга',
    explanationUz: "'Kitob' so'zining ruscha tarjimasi 'Книга'."
  },
  {
    id: 'pt-ru-3',
    level: 'A2',
    category: 'grammar',
    question: "Вчера мы ___ в новом ресторане.",
    options: ['ужинаем', 'ужинали', 'будем ужинать', 'ужинать'],
    correctAnswer: 'ужинали',
    explanationUz: "'Вчера' (kecha) o'tgan zamon bo'lgani sababli 'ужинали' to'g'ri shakl."
  },
  {
    id: 'pt-ru-4',
    level: 'B1',
    category: 'grammar',
    question: "Каждое утро я ___ на работу пешком.",
    options: ['иду', 'хожу', 'пошёл', 'ехать'],
    correctAnswer: 'хожу',
    explanationUz: "Har kuni takrorlanuvchi harakat uchun 'ходить' (хожу) fe'li ishlatiladi."
  },
  {
    id: 'pt-ru-5',
    level: 'B2',
    category: 'vocabulary',
    question: "Какое слово является синонимом слова 'непременно'?",
    options: ['Обязательно', 'Редко', 'Никогда', 'Иногда'],
    correctAnswer: 'Обязательно',
    explanationUz: "'Непременно' so'zi 'albatta' (обязательно) ma'nosini bildiradi."
  }
];
