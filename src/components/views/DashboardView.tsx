import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { LessonProgress, Flashcard, DictionaryEntry } from '../../types';
import { COURSES_DATA } from '../../data/coursesData';
import { STARTER_DICTIONARY } from '../../data/starterDictionary';
import { speakPhrase } from '../../utils/speech';
import { formatPronunciation } from '../../utils/pronunciation';
import {
  Flame,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Volume2,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  RotateCw,
  Mic
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { targetLanguage, cefrLevel, dailyGoal, stats, setActiveNav, refreshStats } = useLanguage();
  const [completedLessons, setCompletedLessons] = useState<LessonProgress[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const progressList = await db.lessonProgress
          .filter((p) => p.language === targetLanguage && p.completed)
          .toArray();
        setCompletedLessons(progressList);

        const nowIso = new Date().toISOString();
        const due = await db.flashcards
          .filter((f) => f.language === targetLanguage && f.dueDate <= nowIso)
          .limit(5)
          .toArray();
        setDueCards(due);

        // Word of the day based on date
        const dictEntries = await db.dictionary
          .filter((d) => d.language === targetLanguage)
          .toArray();
        if (dictEntries.length > 0) {
          const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
          );
          setWordOfTheDay(dictEntries[dayOfYear % dictEntries.length]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [targetLanguage]);

  // Recommended next lesson
  const currentLangLessons = COURSES_DATA.filter((l) => l.language === targetLanguage);
  const completedIds = new Set(completedLessons.map((p) => p.lessonId));
  const nextLesson = currentLangLessons.find((l) => !completedIds.has(l.id)) || currentLangLessons[0];
  const progressPercent = currentLangLessons.length > 0
    ? Math.round((completedLessons.length / currentLangLessons.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <GraduationCap className="w-96 h-96 -mr-20 -mt-10" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
            <span>{flag}</span>
            <span>{langTitle} Dasturi</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Daraja: {cefrLevel}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xush kelibsiz! Bugungi maqsadingiz sari intiling.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Har kuni kichik qadamlar bilan o'rganish sizni ravon nutqqa olib keladi. Bugun yangi qoidalarni o'zlashtiring va intervalli takrorlash kartalarini ko'rib chiqing.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveNav('courses')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shadow-md active:scale-95"
            >
              <span>Darslarni davom ettirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveNav('vocabulary')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-sm transition-all"
            >
              <span>Takrorlash kartalari ({dueCards.length})</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.streakDays} <span className="text-xs font-normal text-slate-500">kun</span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Faollik zanjiri</div>
          </div>
        </div>

        {/* Words Learned */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.wordsLearned}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Yodlangan so'zlar</div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {progressPercent}%
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {completedLessons.length}/{currentLangLessons.length} dars
            </div>
          </div>
        </div>

        {/* Due Flashcards */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {dueCards.length}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Bugungi takrorlash</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Continue Learning & Word of the Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Recommended Lesson Card (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tavsiya etilgan navbatdagi dars
              </h2>
            </div>
            <button
              onClick={() => setActiveNav('courses')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Barcha darslar
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextLesson && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    {nextLesson.level}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {nextLesson.topic}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {nextLesson.titleUz}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {nextLesson.descriptionUz}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>⏳ ~{nextLesson.estimatedMinutes} daqiqa</span>
                  <span>✍️ {nextLesson.questions.length} ta mashq</span>
                </div>
              </div>

              <button
                onClick={() => setActiveNav('courses')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              onClick={() => setActiveNav('pronunciation')}
              className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/40 text-left transition-colors cursor-pointer group"
            >
              <div className="text-blue-600 dark:text-blue-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-600" />
                Talaffuz mashqi
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Ovozli xatolarni aniqlash</p>
            </button>

            <button
              onClick={() => setActiveNav('tutor')}
              className="p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900/40 text-left transition-colors cursor-pointer"
            >
              <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" />
                AI Tyutor
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Savol bering va suhbatlashing</p>
            </button>

            <button
              onClick={() => setActiveNav('checker')}
              className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-900/40 text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Matn tekshirish
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Grammatika va imloni tekshirish</p>
            </button>

            <button
              onClick={() => setActiveNav('exams')}
              className="p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 border border-amber-100 dark:border-amber-900/40 text-left transition-colors cursor-pointer"
            >
              <div className="text-amber-600 dark:text-amber-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Daraja testi
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">CEFR darajangizni aniqlang</p>
            </button>

            <button
              onClick={() => setActiveNav('reading')}
              className="p-3 rounded-xl bg-violet-50/70 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 border border-violet-100 dark:border-violet-900/40 text-left transition-colors cursor-pointer col-span-2 sm:col-span-1"
            >
              <div className="text-violet-600 dark:text-violet-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Mutolaa
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Matn ustida tezkor lug'at</p>
            </button>
          </div>
        </div>

        {/* Word of the Day (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Kunning yangi so'zi
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bugun
              </span>
            </div>

            {wordOfTheDay ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {wordOfTheDay.term}
                    </span>
                    {wordOfTheDay.pronunciation && (
                      <span className="ml-2 text-xs font-mono text-slate-400">
                        {formatPronunciation(wordOfTheDay.pronunciation)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => speakPhrase(wordOfTheDay.term, targetLanguage)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                    title="Talaffuzni eshitish"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {wordOfTheDay.partOfSpeech}
                </div>

                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {wordOfTheDay.uzbekTranslation}
                </div>

                {wordOfTheDay.examples && wordOfTheDay.examples[0] && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 border border-slate-100 dark:border-slate-800">
                    <p className="italic text-slate-800 dark:text-slate-200">
                      "{wordOfTheDay.examples[0].original}"
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      — {wordOfTheDay.examples[0].uzbek}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Lug'at yuklanmoqda...</p>
            )}
          </div>

          <button
            onClick={() => setActiveNav('dictionary')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
          >
            Lug'atdan ko'proq so'z ko'rish
          </button>
        </div>
      </div>
    </div>
  );
};
