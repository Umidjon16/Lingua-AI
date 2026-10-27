import { CefrLevel } from '../types';

export interface CefrEvaluation {
  level: CefrLevel;
  percentage: number;
  levelTitleUz: string;
  descriptionUz: string;
  recommendationsUz: string[];
}

export function evaluateCefrPlacement(score: number, totalQuestions: number): CefrEvaluation {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  if (percentage >= 90) {
    return {
      level: 'C2',
      percentage,
      levelTitleUz: 'Mukammal daraja (Mastery / C2)',
      descriptionUz: "Siz deyarli ona tili darajasida tushunasiz va erkin ifodalaysiz. Murakkab stilistik nozikliklar va ilmiy kontekstlarni tahlil qila olasiz.",
      recommendationsUz: [
        "Murakkab adabiyotlar va tahliliy maqolalar o'qish",
        "Akademik va ilmiy insholar yozish",
        "Nuanslar va frazeologizmlar ustida ishlash"
      ]
    };
  } else if (percentage >= 80) {
    return {
      level: 'C1',
      percentage,
      levelTitleUz: 'Yuqori professional daraja (Effective Operational Proficiency / C1)',
      descriptionUz: "Keng qamrovli murakkab matnlarni tushunasiz va o'z fikringizni erkin, ikkilanmasdan bayon qila olasiz.",
      recommendationsUz: [
        "Biznes va professional mavzularda suhbat amaliyoti",
        "Idiomalar va ilg'or sinonimlar lug'atini boyitish",
        "Murakkab grammatik strukturalar (Inversion, Conditionals)ni mustahkamlash"
      ]
    };
  } else if (percentage >= 65) {
    return {
      level: 'B2',
      percentage,
      levelTitleUz: 'O\'rta-yuqori daraja (Vantage / B2)',
      descriptionUz: "O'z sohangizdagi texnik mavzularni va murakkab matnlarning asosiy g'oyalarini yaxshi tushunasiz. Chet elliklar bilan erkin muloqot qila olasiz.",
      recommendationsUz: [
        "B2 darajadagi grammatika kurslarini yakunlash",
        "Lug'at trenajyorida kuniga kamida 20 ta yangi so'z yodlash",
        "Mutolaa bo'limidagi yangilik va hikoyalarni o'qish"
      ]
    };
  } else if (percentage >= 45) {
    return {
      level: 'B1',
      percentage,
      levelTitleUz: 'Mustaqil o\'rta daraja (Threshold / B1)',
      descriptionUz: "Ish, o'qish, bo'sh vaqt kabi tanish mavzularda erkin suhbatlasha olasiz. Safarlarda yuzaga keladigan ko'plab vaziyatlarni hal qila olasiz.",
      recommendationsUz: [
        "O'tgan, hozirgi va kelasi zamonlarning nozik farqlarini o'rganish",
        "AI repetitor bilan har kuni suhbat amaliyotini o'tkazish",
        "Grammatika bo'limidagi B1 darslarini to'liq amalda bajarish"
      ]
    };
  } else if (percentage >= 25) {
    return {
      level: 'A2',
      percentage,
      levelTitleUz: 'Boshlang\'ich mustaqil daraja (Waystage / A2)',
      descriptionUz: "Oddiy va kundalik mavzularda (oila, xarid, ish, yashash joyi) gaplasha olasiz. Oddiy matnlarni tushuna olasiz.",
      recommendationsUz: [
        "Kundalik 500 ta eng ko'p ishlatiladigan so'zlarni yodlash",
        "A2 grammatika qoidalari va gap tartibi mashqlarini bajarish",
        "Flashcardlar orqali har kuni 15 ta yangi so'zni takrorlash"
      ]
    };
  } else {
    return {
      level: 'A1',
      percentage,
      levelTitleUz: 'Ilk boshlang\'ich daraja (Breakthrough / A1)',
      descriptionUz: "Oddiy iboralar va salomlashishlarni tushunasiz. Sekin va aniq gapirilsa, sodda muloqot qila olasiz.",
      recommendationsUz: [
        "Alifbo, tovushlar va to'g'ri o'qish qoidalari bilan tanishish",
        "A1 kursidagi 'To be' fe'li va asosiy zamonlarni o'zlashtirish",
        "Lug'at bo'limidan eng muhim asosiy so'zlarni to'plash"
      ]
    };
  }
}
