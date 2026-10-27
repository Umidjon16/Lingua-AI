import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { COURSES_DATA } from '../../data/coursesData';
import { Lesson, CefrLevel, LessonProgress } from '../../types';
import { db } from '../../db/linguaDb';
import { LessonModal } from './LessonModal';
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Award,
  BookOpen,
  Info
} from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { targetLanguage, cefrLevel, refreshStats } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'all'>('all');
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  const loadProgress = async () => {
    try {
      const records = await db.lessonProgress
        .filter((p) => p.language === targetLanguage)
        .toArray();
      const map: Record<string, LessonProgress> = {};
      records.forEach((r) => {
        map[r.lessonId] = r;
      });
      setProgressMap(map);
    } catch (err) {
      console.warn('Error loading progress:', err);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [targetLanguage]);

  const levels: (CefrLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const lessonsForLang = COURSES_DATA.filter((l) => l.language === targetLanguage);
  const filteredLessons = lessonsForLang.filter(
    (l) => selectedLevel === 'all' || l.level === selectedLevel
  );

  const completedCount = lessonsForLang.filter((l) => progressMap[l.id]?.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{flag}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {langTitle} Grammatika Kurslari
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A1 dan C2 gacha tuzilgan tizimli darslar xaritasi. Tushuntirishlar sof o'zbek tilida.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-right">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">O'zlashtirish</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">
              {completedCount} / {lessonsForLang.length} dars ({lessonsForLang.length > 0 ? Math.round((completedCount / lessonsForLang.length) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Honest Starter Curriculum Note */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Metodik eslatma:</strong> Ushbu platforma to'liq interaktiv dastur bo'lib, hozirda eng muhim namunaviy A1–B2/C1 darslar to'plami bilan ta'minlangan. Qo'shimcha darslar Admin bo'limidan JSON formatida import qilinishi mumkin.
        </p>
      </div>

      {/* Level Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-400 pl-1">Daraja:</span>
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedLevel === lvl
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {lvl === 'all' ? 'Barcha darajalar' : lvl}
          </button>
        ))}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const progress = progressMap[lesson.id];
          const isDone = progress?.completed;

          return (
            <div
              key={lesson.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                isDone
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      {lesson.level}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {lesson.topic}
                    </span>
                  </div>

                  {isDone ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{progress.bestScore}%</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{lesson.estimatedMinutes} daq
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {lesson.titleUz}
                </h3>
                <p className="text-xs font-medium text-slate-500 italic">
                  {lesson.titleOriginal}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.descriptionUz}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {lesson.questions.length} ta interaktiv mashq
                </span>

                <button
                  onClick={() => setActiveLesson(lesson)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isDone
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10'
                  }`}
                >
                  <span>{isDone ? 'Qayta takrorlash' : 'Darsni boshlash'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Ushbu darajada hozircha dars mavjud emas
          </h3>
          <p className="text-xs text-slate-400">
            Barcha darajalarni tanlang yoki Admin panelidan yangi dars yuklang.
          </p>
        </div>
      )}

      {/* Active Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          onClose={() => setActiveLesson(null)}
          onCompleted={() => {
            loadProgress();
            refreshStats();
          }}
        />
      )}
    </div>
  );
};
