import { LibraryMemoryItem, DictionaryEntry, LearningLanguage } from '../types';
import { normalizeWord } from './dictionarySearch';

export function searchLibraryMemory(
  items: LibraryMemoryItem[],
  query: string,
  language?: LearningLanguage
): LibraryMemoryItem[] {
  const normQuery = normalizeWord(query);
  let filtered = items;
  if (language) {
    filtered = filtered.filter((item) => item.language === language);
  }

  if (!normQuery) {
    return filtered;
  }

  const queryTokens = normQuery.split(/\s+/).filter(Boolean);

  const scored = filtered.map((item) => {
    let score = 0;
    const titleNorm = normalizeWord(item.titleUz);
    const origNorm = normalizeWord(item.original);
    const topicNorm = normalizeWord(item.topic);
    const transNorm = normalizeWord(item.translationUz);
    const explanationNorm = normalizeWord(item.explanationUz);

    // Exact matches
    if (titleNorm.includes(normQuery) || origNorm.includes(normQuery)) {
      score += 50;
    }

    // Token matches
    queryTokens.forEach((token) => {
      if (titleNorm.includes(token)) score += 20;
      if (origNorm.includes(token)) score += 20;
      if (topicNorm.includes(token)) score += 15;
      if (transNorm.includes(token)) score += 15;
      if (item.tags.some((t) => normalizeWord(t).includes(token))) score += 25;
      if (explanationNorm.includes(token)) score += 10;
    });

    return { item, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

export interface OfflineMemoryAnswer {
  hasMatch: boolean;
  titleUz: string;
  answerMarkdown: string;
  matchedItems: string[];
}

export function generateOfflineAnswerFromMemory(
  query: string,
  language: LearningLanguage,
  memoryItems: LibraryMemoryItem[],
  dictEntries: DictionaryEntry[]
): OfflineMemoryAnswer {
  const normQuery = normalizeWord(query);
  const langTitle = language === 'ru' ? 'Rus tili' : 'Ingliz tili';

  // 1. Check if user is asking for a word translation or definition
  const dictMatches = dictEntries.filter((d) => {
    const termNorm = normalizeWord(d.term);
    const uzNorm = normalizeWord(d.uzbekTranslation);
    return (
      termNorm === normQuery ||
      uzNorm === normQuery ||
      (normQuery.length > 2 && (termNorm.includes(normQuery) || uzNorm.includes(normQuery)))
    );
  });

  if (dictMatches.length > 0) {
    const top = dictMatches[0];
    let md = `### 📖 Oflayn Lug'at Xotirasidan:\n\n`;
    md += `**So'z:** \`${top.term}\` ${top.pronunciation ? `*${top.pronunciation}*` : ''}\n`;
    md += `**So'z turkumi:** ${top.partOfSpeech}\n`;
    md += `**O'zbekcha ma'nosi:** **${top.uzbekTranslation}**\n\n`;

    if (top.examples && top.examples.length > 0) {
      md += `**Namunaviy gaplar:**\n`;
      top.examples.forEach((ex) => {
        md += `- *"${ex.original}"* — ${ex.uzbek}\n`;
      });
    }

    if (top.synonyms && top.synonyms.length > 0) {
      md += `\n**Sinonimlar:** ${top.synonyms.join(', ')}\n`;
    }

    md += `\n*(Bu javob qurilmangizning oflayn xotira bazasidan topildi)*`;

    return {
      hasMatch: true,
      titleUz: `Lug'at: ${top.term}`,
      answerMarkdown: md,
      matchedItems: [top.term]
    };
  }

  // 2. Check knowledge memory items (grammar, phrasebook, dialogue, idioms)
  const memoryMatches = searchLibraryMemory(memoryItems, query, language);

  if (memoryMatches.length > 0) {
    const top = memoryMatches[0];
    let md = `### 📚 Kutubxona Bilimlar Xotirasidan:\n\n`;
    md += `#### ${top.titleUz} (*${top.original}*)\n\n`;
    md += `**Mavzu:** ${top.topic} | **Turi:** ${top.category}\n\n`;
    md += `**Tushuntirish:**\n${top.explanationUz}\n\n`;

    if (top.examples && top.examples.length > 0) {
      md += `**Misollar va Jonli Iboralar:**\n`;
      top.examples.forEach((ex) => {
        md += `- **${ex.original}**\n  *O'zbekcha:* ${ex.uzbek}\n`;
      });
    }

    md += `\n*(Oflayn rejim: Siz bergan savol mahalliy bilimlar xotirasidagi ma'lumotlar bilan to'liq mos keldi)*`;

    return {
      hasMatch: true,
      titleUz: top.titleUz,
      answerMarkdown: md,
      matchedItems: [top.titleUz]
    };
  }

  // 3. Fallback when completely offline and no exact token matched
  let fallbackMd = `### 🔍 Oflayn Xotira Tahlili\n\n`;
  fallbackMd += `Siz kiritgan savol: **"${query}"**\n\n`;
  fallbackMd += `Hozirda qurilmangiz **Oflayn rejimda** yoki tashqi internet tarmog'isiz ishlamoqda. Mahalliy lug'at va kutubxona xotirasida ushbu so'z bo'yicha to'g'ridan-to'g'ri kalit topilmadi.\n\n`;
  fallbackMd += `**Tavsiya:**\n`;
  fallbackMd += `- Aniqroq so'z yoki iborani qidirib ko'ring (masalan: *${language === 'ru' ? 'падежи, успех, привет' : 'achieve, present perfect, travel'}*);\n`;
  fallbackMd += `- Internet mavjud bo'lganda Onlayn rejimda to'liq jonli qidiruv va tahlil amalga oshiriladi.\n`;
  fallbackMd += `- Barcha grammatika darslari va testlar esa to'liq oflayn ishlaydi.`;

  return {
    hasMatch: false,
    titleUz: "Oflayn qidiruv natijasi",
    answerMarkdown: fallbackMd,
    matchedItems: []
  };
}
