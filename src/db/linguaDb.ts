import Dexie, { type Table } from 'dexie';
import {
  DictionaryEntry,
  Flashcard,
  LessonProgress,
  PlacementTestResult,
  WritingCheckRecord,
  DailyActivityRecord,
  UserPreferences,
  TutorChatMessage,
  LibraryMemoryItem,
  LearningLanguage,
  CefrLevel,
  InterfaceLanguage
} from '../types';
import { STARTER_DICTIONARY } from '../data/starterDictionary';
import { STARTER_LIBRARY_MEMORY } from '../data/libraryMemoryData';

export class LinguaDatabase extends Dexie {
  dictionary!: Table<DictionaryEntry, string>;
  flashcards!: Table<Flashcard, string>;
  lessonProgress!: Table<LessonProgress, string>;
  placementResults!: Table<PlacementTestResult, string>;
  writingChecks!: Table<WritingCheckRecord, string>;
  activityLog!: Table<DailyActivityRecord, string>;
  preferences!: Table<{ key: string; value: any }, string>;
  tutorMessages!: Table<TutorChatMessage, string>;
  libraryMemory!: Table<LibraryMemoryItem, string>;

  constructor() {
    super('LinguaAiDatabase');
    this.version(1).stores({
      dictionary: 'id, language, term, uzbekTranslation, partOfSpeech, isFavorite, isCustom',
      flashcards: 'id, language, term, dueDate, state, repetition',
      lessonProgress: 'id, lessonId, language, completed',
      placementResults: 'id, language, date, estimatedLevel',
      writingChecks: 'id, language, timestamp',
      activityLog: 'date',
      preferences: 'key'
    });

    this.version(2).stores({
      dictionary: 'id, language, term, uzbekTranslation, partOfSpeech, isFavorite, isCustom',
      flashcards: 'id, language, term, dueDate, state, repetition',
      lessonProgress: 'id, lessonId, language, completed',
      placementResults: 'id, language, date, estimatedLevel',
      writingChecks: 'id, language, timestamp',
      activityLog: 'date',
      preferences: 'key',
      tutorMessages: 'id, sessionId, language, role, timestamp',
      libraryMemory: 'id, language, category, topic, titleUz'
    });
  }
}

export const db = new LinguaDatabase();

export async function initializeDatabase(): Promise<void> {
  const count = await db.dictionary.count();
  if (count === 0) {
    // Seed initial dictionary
    await db.dictionary.bulkAdd(STARTER_DICTIONARY);

    // Seed initial flashcards from top entries
    const initialFlashcards: Flashcard[] = STARTER_DICTIONARY.slice(0, 8).map((entry) => ({
      id: `fc-${entry.id}`,
      dictionaryEntryId: entry.id,
      language: entry.language,
      term: entry.term,
      translation: entry.uzbekTranslation,
      exampleSentence: entry.examples[0]?.original,
      exampleUzbek: entry.examples[0]?.uzbek,
      pronunciation: entry.pronunciation,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      dueDate: new Date().toISOString(),
      timesReviewed: 0,
      lapses: 0,
      state: 'new'
    }));

    await db.flashcards.bulkAdd(initialFlashcards);

    // Seed default preferences
    const defaultPrefs: UserPreferences = {
      selectedLanguage: 'en',
      interfaceLanguage: 'uz',
      cefrLevel: 'A1',
      dailyGoalWords: 10,
      theme: 'light',
      soundEnabled: true,
      autoSpeak: false
    };

    await db.preferences.put({ key: 'user_preferences', value: defaultPrefs });

    // Seed initial activity record for today
    const today = new Date().toISOString().split('T')[0];
    await db.activityLog.put({
      date: today,
      wordsReviewed: 5,
      lessonsCompleted: 1,
      timeSpentSeconds: 420
    });
  }

  // Seed library memory if empty
  const memoryCount = await db.libraryMemory.count();
  if (memoryCount === 0) {
    await db.libraryMemory.bulkAdd(STARTER_LIBRARY_MEMORY);
  }
}
