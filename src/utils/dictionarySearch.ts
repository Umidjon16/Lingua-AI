import { DictionaryEntry, LearningLanguage } from '../types';

export function normalizeWord(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[ʻ’'`ʼ]/g, "'")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

export function searchDictionaryEntries(
  entries: DictionaryEntry[],
  query: string,
  options?: {
    language?: LearningLanguage;
    partOfSpeech?: string;
    favoritesOnly?: boolean;
  }
): DictionaryEntry[] {
  const normQuery = normalizeWord(query);

  let filtered = entries;
  if (options?.language) {
    filtered = filtered.filter((e) => e.language === options.language);
  }
  if (options?.partOfSpeech && options.partOfSpeech !== 'all') {
    filtered = filtered.filter((e) => e.partOfSpeech.toLowerCase() === options.partOfSpeech?.toLowerCase());
  }
  if (options?.favoritesOnly) {
    filtered = filtered.filter((e) => e.isFavorite);
  }

  if (!normQuery) {
    return filtered;
  }

  // Calculate matching relevance
  const scored = filtered.map((entry) => {
    const termNorm = normalizeWord(entry.term);
    const uzNorm = normalizeWord(entry.uzbekTranslation);
    let score = 0;

    // Exact match gets highest score
    if (termNorm === normQuery || uzNorm === normQuery) {
      score += 100;
    }
    // Starts with gets high score
    else if (termNorm.startsWith(normQuery) || uzNorm.startsWith(normQuery)) {
      score += 50;
    }
    // Contains full word gets medium score
    else if (termNorm.includes(normQuery) || uzNorm.includes(normQuery)) {
      score += 25;
    }
    // Synonyms match
    else if (entry.synonyms?.some((s) => normalizeWord(s).includes(normQuery))) {
      score += 15;
    }
    // Examples match
    else if (entry.examples?.some((ex) => normalizeWord(ex.original).includes(normQuery) || normalizeWord(ex.uzbek).includes(normQuery))) {
      score += 10;
    }

    return { entry, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.entry);
}
