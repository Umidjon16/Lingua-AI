import test from 'node:test';
import assert from 'node:assert/strict';
import { searchLibraryMemory, generateOfflineAnswerFromMemory } from './librarySearch';
import { LibraryMemoryItem, DictionaryEntry } from '../types';

const mockMemory: LibraryMemoryItem[] = [
  {
    id: 'm1',
    language: 'en',
    category: 'grammar_rule',
    topic: 'Tenses',
    titleUz: 'Present Perfect va Past Simple farqi',
    original: 'Present Perfect vs Past Simple',
    translationUz: 'Zamonlar farqi',
    explanationUz: 'Past Simple aniq vaqt bilan, Present Perfect esa natija bilan boglanadi.',
    examples: [{ original: 'I lost my keys yesterday', uzbek: 'Kecha kalitimni yoqotdim' }],
    tags: ['perfect', 'past', 'tenses']
  },
  {
    id: 'm2',
    language: 'en',
    category: 'phrasebook',
    topic: 'Travel',
    titleUz: 'Aeroport va Sayohat iboralari',
    original: 'Airport phrases',
    translationUz: 'Aeroport iboralari',
    explanationUz: 'Aeroportda kerak boladigan iboralar.',
    examples: [{ original: 'Where is my gate?', uzbek: 'Chiqish eshigi qayerda?' }],
    tags: ['travel', 'airport', 'sayohat']
  }
];

const mockDict: DictionaryEntry[] = [
  {
    id: 'd1',
    language: 'en',
    term: 'achieve',
    uzbekTranslation: "erishmoq, qo'lga kiritmoq",
    partOfSpeech: 'verb',
    pronunciation: '[uh-cheev]',
    examples: [{ original: 'Achieve goals', uzbek: 'Maqsadlarga erishish' }]
  }
];

test('searchLibraryMemory finds item by tag and topic', () => {
  const res = searchLibraryMemory(mockMemory, 'airport', 'en');
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 'm2');
});

test('generateOfflineAnswerFromMemory finds word in dictionary', () => {
  const ans = generateOfflineAnswerFromMemory('achieve', 'en', mockMemory, mockDict);
  assert.equal(ans.hasMatch, true);
  assert.ok(ans.answerMarkdown.includes("erishmoq, qo'lga kiritmoq"));
});

test('generateOfflineAnswerFromMemory finds grammar rule in library memory', () => {
  const ans = generateOfflineAnswerFromMemory('Present Perfect qoidasi qanday?', 'en', mockMemory, mockDict);
  assert.equal(ans.hasMatch, true);
  assert.ok(ans.answerMarkdown.includes('Present Perfect va Past Simple farqi'));
});
