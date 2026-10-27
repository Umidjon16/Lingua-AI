export type LearningLanguage = 'en' | 'ru';
export type InterfaceLanguage = 'uz' | 'en' | 'ru';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuestionType = 'choice' | 'fill' | 'order' | 'correct';

export interface Question {
  id: string;
  type: QuestionType;
  promptUz: string;
  targetSentence?: string;
  options?: string[];
  correctAnswer: string;
  explanationUz: string;
  wordBank?: string[]; // for sentence ordering
}

export interface LessonExample {
  original: string;
  uzbek: string;
  note?: string;
}

export interface Lesson {
  id: string;
  language: LearningLanguage;
  level: CefrLevel;
  order: number;
  topic: string;
  titleUz: string;
  titleOriginal: string;
  descriptionUz: string;
  rulesUz: string[];
  examples: LessonExample[];
  commonMistakesUz: {
    wrong: string;
    correct: string;
    reasonUz: string;
  }[];
  questions: Question[];
  estimatedMinutes: number;
}

export interface DictionaryEntry {
  id: string;
  language: LearningLanguage;
  term: string;
  uzbekTranslation: string;
  partOfSpeech: string;
  pronunciation?: string;
  examples: {
    original: string;
    uzbek: string;
  }[];
  synonyms?: string[];
  tags?: string[];
  isFavorite?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export interface Flashcard {
  id: string;
  dictionaryEntryId?: string;
  language: LearningLanguage;
  term: string;
  translation: string;
  exampleSentence?: string;
  exampleUzbek?: string;
  pronunciation?: string;
  // SM-2 parameters
  interval: number; // in days
  repetition: number;
  efactor: number; // Easiness factor >= 1.3
  dueDate: string; // ISO date string
  lastReviewedDate?: string;
  timesReviewed: number;
  lapses: number;
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface LessonProgress {
  id: string;
  lessonId: string;
  language: LearningLanguage;
  completed: boolean;
  lastScore: number;
  bestScore: number;
  completedAt?: string;
  attemptsCount: number;
}

export interface PlacementTestQuestion {
  id: string;
  level: CefrLevel;
  category: 'grammar' | 'vocabulary' | 'reading';
  question: string;
  options: string[];
  correctAnswer: string;
  explanationUz: string;
}

export interface PlacementTestResult {
  id: string;
  language: LearningLanguage;
  date: string;
  score: number;
  totalQuestions: number;
  estimatedLevel: CefrLevel;
  feedbackUz: string;
  categoryScores: {
    grammar: number;
    vocabulary: number;
    reading: number;
  };
}

export interface ReadingText {
  id: string;
  language: LearningLanguage;
  level: CefrLevel;
  title: string;
  category: string;
  content: string;
  uzbekSummary: string;
  glossary: Record<string, string>; // lowercased word -> uzbek translation
  comprehensionQuestions: {
    questionUz: string;
    options: string[];
    correctIndex: number;
    explanationUz: string;
  }[];
}

export interface WritingCheckIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'info';
  originalSnippet: string;
  suggestion: string;
  explanationUz: string;
}

export interface WritingCheckRecord {
  id: string;
  language: LearningLanguage;
  timestamp: string;
  originalText: string;
  correctedText: string;
  score: number;
  issues: WritingCheckIssue[];
  overallFeedbackUz: string;
  challengeInfo?: {
    taskTitle?: string;
    taskType?: string;
    requiredWords?: string[];
    taskCompleted?: boolean;
    taskFeedbackUz?: string;
  };
}

export interface UserPreferences {
  selectedLanguage: LearningLanguage;
  interfaceLanguage: InterfaceLanguage;
  cefrLevel: CefrLevel;
  dailyGoalWords: number;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  autoSpeak: boolean;
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  wordsReviewed: number;
  lessonsCompleted: number;
  timeSpentSeconds: number;
}

export interface TutorChatMessage {
  id: string;
  sessionId: string;
  language: LearningLanguage;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isDemo?: boolean;
  source?: 'local_memory' | 'online_gemini' | 'demo';
  matchedMemoryTitles?: string[];
}

export interface LibraryMemoryItem {
  id: string;
  language: LearningLanguage;
  category: 'vocabulary' | 'grammar_rule' | 'idiom' | 'dialogue' | 'phrasebook';
  topic: string;
  titleUz: string;
  original: string;
  translationUz: string;
  explanationUz: string;
  examples: {
    original: string;
    uzbek: string;
  }[];
  tags: string[];
}
