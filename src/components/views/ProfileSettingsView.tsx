import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { LearningLanguage, InterfaceLanguage, CefrLevel } from '../../types';
import {
  User,
  Shield,
  Settings,
  Languages,
  Moon,
  Sun,
  Flame,
  Award,
  Database,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  Info
} from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const {
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
    setShowSetupModal
  } = useLanguage();

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportData = async () => {
    const fullBackup = {
      date: new Date().toISOString(),
      dictionary: await db.dictionary.toArray(),
      flashcards: await db.flashcards.toArray(),
      progress: await db.lessonProgress.toArray()
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-profile-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Foydalanuvchi ma'lumotlari zaxiralandi!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20 shrink-0">
          U
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Mehmon Foydalanuvchi (Guest Mode)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Oflayn Faol
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hisob yaratmasdan to'liq shaxsiy IndexedDB xotirasidan foydalanmoqdasiz.
          </p>
        </div>

        <button
          onClick={() => setShowSetupModal(true)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0"
        >
          Bulutli sozlamalar
        </button>
      </div>

      {/* Learning Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Languages className="w-4 h-4 text-blue-600" />
          O'rganish parametrlari
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Target language */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              O'rganilayotgan asosiy til:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTargetLanguage('en')}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  targetLanguage === 'en'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🇬🇧 Ingliz tili
              </button>
              <button
                onClick={() => setTargetLanguage('ru')}
                className={`p-3 rounded-xl border font-bold text-center transition-all ${
                  targetLanguage === 'ru'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🇷🇺 Rus tili
              </button>
            </div>
          </div>

          {/* Current CEFR Level */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Joriy CEFR Darajangiz:
            </label>
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as CefrLevel)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              <option value="A1">A1 — Boshlang'ich (Breakthrough)</option>
              <option value="A2">A2 — Boshlang'ich mustaqil (Waystage)</option>
              <option value="B1">B1 — O'rta (Threshold)</option>
              <option value="B2">B2 — Yuqori o'rta (Vantage)</option>
              <option value="C1">C1 — Ilg'or (Effective Proficiency)</option>
              <option value="C2">C2 — Mukammal (Mastery)</option>
            </select>
          </div>

          {/* Interface Language */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Interfeys va tushuntirish tili:
            </label>
            <select
              value={interfaceLanguage}
              onChange={(e) => setInterfaceLanguage(e.target.value as InterfaceLanguage)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="uz">O'zbek tili (Lotin yozuvi)</option>
              <option value="en">English (Inglizcha interfeys)</option>
              <option value="ru">Русский (Ruscha interfeys)</option>
            </select>
          </div>

          {/* Daily Goal */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              Kunlik so'z yodlash maqsadi:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 20].map((goal) => (
                <button
                  key={goal}
                  onClick={() => setDailyGoal(goal)}
                  className={`py-2 rounded-xl border font-bold text-center transition-all ${
                    dailyGoal === goal
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {goal} ta
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Accessibility */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            Tashqi ko'rinish va Rejim (Theme)
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            {theme === 'dark' ? '🌙 Tungi rejim' : '☀️ Yorug\' rejim'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              showToast("Kunduzgi yorug' rejim faollashtirildi! ☀️");
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-slate-900">Kunduzgi rejim</span>
              <span className="text-[11px] text-slate-500">Yorug' va toza dizayn</span>
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              showToast("Tungi qora rejim faollashtirildi! 🌙");
            }}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              theme === 'dark'
                ? 'border-blue-500 bg-slate-800 text-white shadow-sm ring-2 ring-blue-500/30'
                : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold">
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              )}
            </div>
            <div>
              <span className="font-bold text-sm block text-slate-100">Tungi rejim</span>
              <span className="text-[11px] text-slate-400">Ko'zni charchatmaydigan qorong'i fon</span>
            </div>
          </button>
        </div>
      </div>

      {/* Privacy & Local Data Protection */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Maxfiylik va Xavfsizlik Kafolati
        </h3>

        <p className="leading-relaxed">
          Lingua AI sizning shaxsiy ma'lumotlaringizni hurmat qiladi. Barcha shaxsiy lug'atlar va o'rganish tarixi brauzeringizning ichki <strong>IndexedDB</strong> xotirasida saqlanadi. Hech qanday soxta obuna yoki yashirin to'lovlar mavjud emas.
        </p>

        <div className="pt-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Shaxsiy ma'lumotlarni yuklab olish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
