import React, { createContext, useContext, useState, useEffect } from 'react';
import { LearningLanguage, InterfaceLanguage, CefrLevel, UserPreferences } from '../types';
import { db, initializeDatabase } from '../db/linguaDb';

interface GlobalStats {
  wordsLearned: number;
  lessonsCompleted: number;
  streakDays: number;
  dueReviewsCount: number;
}

interface LanguageContextType {
  targetLanguage: LearningLanguage;
  setTargetLanguage: (lang: LearningLanguage) => void;
  interfaceLanguage: InterfaceLanguage;
  setInterfaceLanguage: (lang: InterfaceLanguage) => void;
  cefrLevel: CefrLevel;
  setCefrLevel: (level: CefrLevel) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isOnline: boolean;
  stats: GlobalStats;
  refreshStats: () => Promise<void>;
  showSetupModal: boolean;
  setShowSetupModal: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetLanguage, setTargetLanguageState] = useState<LearningLanguage>('en');
  const [interfaceLanguage, setInterfaceLanguageState] = useState<InterfaceLanguage>('uz');
  const [cefrLevel, setCefrLevelState] = useState<CefrLevel>('A1');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lingua_theme');
      if (stored === 'dark' || stored === 'light') {
        if (stored === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return stored;
      }
    }
    return 'light';
  });
  const [dailyGoal, setDailyGoalState] = useState<number>(10);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [stats, setStats] = useState<GlobalStats>({
    wordsLearned: 0,
    lessonsCompleted: 0,
    streakDays: 3,
    dueReviewsCount: 0
  });

  const refreshStats = async () => {
    try {
      const wordsCount = await db.dictionary.filter(d => d.language === targetLanguage).count();
      const lessonsCount = await db.lessonProgress.filter(l => l.language === targetLanguage && l.completed).count();
      
      const nowIso = new Date().toISOString();
      const dueCards = await db.flashcards
        .filter(f => f.language === targetLanguage && f.dueDate <= nowIso)
        .count();

      setStats(prev => ({
        ...prev,
        wordsLearned: wordsCount,
        lessonsCompleted: lessonsCount,
        dueReviewsCount: dueCards
      }));
    } catch (e) {
      console.warn('Failed to refresh stats:', e);
    }
  };

  useEffect(() => {
    // Initialize DB and load saved preferences
    initializeDatabase().then(async () => {
      const prefRecord = await db.preferences.get('user_preferences');
      if (prefRecord?.value) {
        const p: UserPreferences = prefRecord.value;
        setTargetLanguageState(p.selectedLanguage || 'en');
        setInterfaceLanguageState(p.interfaceLanguage || 'uz');
        setCefrLevelState(p.cefrLevel || 'A1');
        setDailyGoalState(p.dailyGoalWords || 10);
        if (p.theme === 'dark' || p.theme === 'light') {
          setThemeState(p.theme);
          if (p.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
      await refreshStats();
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    refreshStats();
  }, [targetLanguage]);

  const savePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const current = (await db.preferences.get('user_preferences'))?.value || {};
      const updated = { ...current, ...updates };
      await db.preferences.put({ key: 'user_preferences', value: updated });
    } catch (e) {
      console.warn('Error saving preferences:', e);
    }
  };

  const setTargetLanguage = (lang: LearningLanguage) => {
    setTargetLanguageState(lang);
    savePreferences({ selectedLanguage: lang });
  };

  const setInterfaceLanguage = (lang: InterfaceLanguage) => {
    setInterfaceLanguageState(lang);
    savePreferences({ interfaceLanguage: lang });
  };

  const setCefrLevel = (level: CefrLevel) => {
    setCefrLevelState(level);
    savePreferences({ cefrLevel: level });
  };

  const setDailyGoal = (goal: number) => {
    setDailyGoalState(goal);
    savePreferences({ dailyGoalWords: goal });
  };

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    setThemeState(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lingua_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    savePreferences({ theme: nextTheme });
  };

  const setTheme = (nextTheme: 'light' | 'dark') => {
    applyTheme(nextTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        targetLanguage,
        setTargetLanguage,
        interfaceLanguage,
        setInterfaceLanguage,
        cefrLevel,
        setCefrLevel,
        theme,
        setTheme,
        toggleTheme,
        dailyGoal,
        setDailyGoal,
        activeNav,
        setActiveNav,
        isOnline,
        stats,
        refreshStats,
        showSetupModal,
        setShowSetupModal,
        globalSearchQuery,
        setGlobalSearchQuery
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
