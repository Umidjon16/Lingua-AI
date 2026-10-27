import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDictionaryEntries, normalizeWord } from './dictionarySearch';
import { DictionaryEntry } from '../types';

const mockEntries: DictionaryEntry[] = [
  {
    id: '1',
    language: 'en',
    term: 'apple',
    uzbekTranslation: 'olma',
    partOfSpeech: 'noun',
    examples: [{ original: 'I eat an apple.', uzbek: "Men olma yeyman." }],
    synonyms: ['fruit'],
    isFavorite: true
  },
  {
    id: '2',
    language: 'en',
    term: 'book',
    uzbekTranslation: 'kitob',
    partOfSpeech: 'noun',
    examples: [{ original: 'Read this book.', uzbek: "Ushbu kitobni o'qing." }],
    synonyms: ['volume', 'novel'],
    isFavorite: false
  },
  {
    id: '3',
    language: 'ru',
    term: 'книга',
    uzbekTranslation: 'kitob',
    partOfSpeech: 'noun',
    examples: [{ original: 'Интересная книга.', uzbek: "Qiziqarli kitob." }],
    synonyms: ['том'],
    isFavorite: true
  }
];

test('normalizeWord trims and removes punctuation', () => {
  assert.equal(normalizeWord("  O'g'il bola! "), "o'g'il bola");
});

test('searchDictionaryEntries finds exact matches with highest priority', () => {
  const results = searchDictionaryEntries(mockEntries, 'apple');
  assert.equal(results.length, 1);
  assert.equal(results[0].term, 'apple');
});

test('searchDictionaryEntries finds entries by Uzbek translation', () => {
  const results = searchDictionaryEntries(mockEntries, 'kitob');
  assert.equal(results.length, 2);
});

test('searchDictionaryEntries filters by language', () => {
  const enResults = searchDictionaryEntries(mockEntries, 'kitob', { language: 'en' });
  assert.equal(enResults.length, 1);
  assert.equal(enResults[0].term, 'book');
});

test('searchDictionaryEntries filters by favorites', () => {
  const favResults = searchDictionaryEntries(mockEntries, '', { favoritesOnly: true });
  assert.equal(favResults.length, 2);
});
