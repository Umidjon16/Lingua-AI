import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { DailyActivityRecord, LessonProgress, Flashcard } from '../../types';
import {
  BarChart3,
  Flame,
  Award,
  BookOpen,
  Clock,
  Download,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const StatisticsView: React.FC = () => {
  const { targetLanguage, stats, refreshStats } = useLanguage();
  const [activityLogs, setActivityLogs] = useState<DailyActivityRecord[]>([]);
  const [completedLessons, setCompletedLessons] = useState<LessonProgress[]>([]);
  const [masteredCardsCount, setMasteredCardsCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  useEffect(() => {
    async function loadStatsData() {
      try {
        const logs = await db.activityLog.toArray();
        setActivityLogs(logs);

        const prog = await db.lessonProgress
          .filter((p) => p.language === targetLanguage && p.completed)
          .toArray();
        setCompletedLessons(prog);

        const mastered = await db.flashcards
          .filter((f) => f.language === targetLanguage && f.state === 'mastered')
          .count();
        setMasteredCardsCount(mastered);
      } catch (err) {
        console.warn('Error loading stats:', err);
      }
    }
    loadStatsData();
  }, [targetLanguage]);

  // Total study time calculation
  const totalMinutes = activityLogs.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0) / 60;

  // Average quiz score
  const avgScore = completedLessons.length > 0
    ? Math.round(completedLessons.reduce((acc, curr) => acc + curr.bestScore, 0) / completedLessons.length)
    : 0;

  const handleExportFullBackup = async () => {
    const fullData = {
      exportedAt: new Date().toISOString(),
      targetLanguage,
      dictionary: await db.dictionary.toArray(),
      flashcards: await db.flashcards.toArray(),
      lessonProgress: await db.lessonProgress.toArray(),
      placementResults: await db.placementResults.toArray(),
      activityLog: await db.activityLog.toArray()
    };

    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-ai-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    try {
      await db.lessonProgress.clear();
      await db.flashcards.clear();
      await db.placementResults.clear();
      await db.writingChecks.clear();
      await db.activityLog.clear();
      setShowClearConfirm(false);
      refreshStats();
      window.location.reload();
    } catch (err) {
      alert("Ma'lumotlarni tozalashda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{flag}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              O'rganish Statistikasi va Tahlil
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Haqiqiy saqlangan mashg'ulotlar, SM-2 takrorlashlari va viktorinalar tahlili.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFullBackup}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>To'liq zaxira (Export)</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Barcha ma'lumotlarni tozalash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">Faollik zanjiri</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{stats.streakDays}</span>
            <span className="text-xs text-slate-500">kun</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">Tugatilgan darslar</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {completedLessons.length}
            </span>
            <span className="text-xs text-slate-500">ta dars</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">O'zlashtirilgan so'zlar</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {masteredCardsCount}
            </span>
            <span className="text-xs text-slate-500">mukammal</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium">O'rtacha viktorina balli</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {avgScore}%
            </span>
            <span className="text-xs text-slate-500">aniqlik</span>
          </div>
        </div>
      </div>

      {/* Activity Heatmap / Daily Log Display */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Kunlik o'rganish faolligi tarixi
        </h3>

        <div className="space-y-2">
          {activityLogs.map((log) => (
            <div
              key={log.date}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {log.date}
                </span>
                <span className="text-slate-500">
                  {log.wordsReviewed} ta so'z takrorlandi
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {log.lessonsCompleted} ta dars
                </span>
                <span className="text-slate-400">
                  ~{Math.round(log.timeSpentSeconds / 60)} daqiqa
                </span>
              </div>
            </div>
          ))}

          {activityLogs.length === 0 && (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Faollik ma'lumotlari to'planmoqda...
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Barcha ma'lumotlarni tozalash?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ushbu amal barcha test natijalari, lug'at kartochkalari va o'rganish tarixini butunlay o'chirib tashlaydi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleClearAllData}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Ha, tozalash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
