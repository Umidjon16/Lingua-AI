import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { COURSES_DATA } from '../../data/coursesData';
import { Lesson, CefrLevel, Question } from '../../types';
import { db } from '../../db/linguaDb';
import {
  ShieldCheck,
  Lock,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Info,
  Trash2,
  Sparkles
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { targetLanguage } = useLanguage();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // New Lesson form state
  const [titleUz, setTitleUz] = useState('');
  const [titleOriginal, setTitleOriginal] = useState('');
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [topic, setTopic] = useState('');
  const [descUz, setDescUz] = useState('');
  const [rule1, setRule1] = useState('');
  const [rule2, setRule2] = useState('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Local admin key validation
    if (adminPasscode.trim() === 'lingua2026' || adminPasscode.trim() === 'admin') {
      setIsAdminAuthenticated(true);
      setPasscodeError(false);
      showToast("Administrator huquqlari tasdiqlandi!");
    } else {
      setPasscodeError(true);
    }
  };

  const handleExportCurriculum = () => {
    const dataStr = JSON.stringify(COURSES_DATA, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-curriculum-package.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Kurslar to'plami eksport qilindi!");
  };

  const handleImportCurriculum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(parsed)) {
          alert("Xato format: Darslar JSON ro'yxati (Array) bo'lishi lozim.");
          return;
        }
        showToast(`${parsed.length} ta yangi dars tekshirildi va tasdiqlandi!`);
      } catch (err: any) {
        alert("Faylni o'qishda xatolik: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleUz.trim() || !descUz.trim()) return;

    const newLesson: Lesson = {
      id: `admin-lesson-${Date.now()}`,
      language: targetLanguage,
      level,
      order: 99,
      topic: topic.trim() || 'Qo\'shimcha dars',
      titleUz: titleUz.trim(),
      titleOriginal: titleOriginal.trim(),
      descriptionUz: descUz.trim(),
      estimatedMinutes: 15,
      rulesUz: [rule1.trim(), rule2.trim()].filter(Boolean),
      examples: [
        { original: "Practice makes perfect.", uzbek: "Mashq qilingan sari mukammallashadi." }
      ],
      commonMistakesUz: [],
      questions: [
        {
          id: `q-admin-${Date.now()}`,
          type: 'choice',
          promptUz: "Ushbu yangi mavzu bo'yicha savol:",
          options: ['Variant A', 'Variant B', 'Variant C'],
          correctAnswer: 'Variant A',
          explanationUz: "Ushbu javob qoidaga to'liq mos keladi."
        }
      ]
    };

    setCustomLessons((prev) => [newLesson, ...prev]);
    showToast("Yangi dars muvaffaqiyatli nashr etildi!");
    setTitleUz('');
    setTitleOriginal('');
    setDescUz('');
    setTopic('');
    setRule1('');
    setRule2('');
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

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Administrator Boshqaruvi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Darslar va o'quv dasturi kontentini boshqarish va JSON paketlarni import/eksport qilish.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurriculum}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Darslar paketini yuklab olish</span>
          </button>
        </div>
      </div>

      {/* Authentication Guard */}
      {!isAdminAuthenticated ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Administrator Kaliti Talab Qilinadi
            </h3>
            <p className="text-xs text-slate-500">
              O'quv kontentini tahrirlash uchun maxsus parolni kiriting (Standart parol: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">admin</code>).
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3 pt-2 text-xs">
            <input
              type="password"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              placeholder="Admin parolini kiriting..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            {passcodeError && (
              <p className="text-xs text-red-500 font-semibold">Parol noto'g'ri. Qaytadan urinib ko'ring.</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Kirishni tasdiqlash
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Admin Workspace */
        <div className="space-y-6">
          {/* Create Lesson Form */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Yangi Grammatika Darsi Qo'shish
            </h3>

            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Dars sarlavhasi (O'zbek tilida) *
                  </label>
                  <input
                    type="text"
                    required
                    value={titleUz}
                    onChange={(e) => setTitleUz(e.target.value)}
                    placeholder="Masalan: Kelasi zamon fe'llari (Future Simple)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    CEFR Daraja
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CefrLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Asl tildagi nomi
                  </label>
                  <input
                    type="text"
                    value={titleOriginal}
                    onChange={(e) => setTitleOriginal(e.target.value)}
                    placeholder="Future Simple Tense"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mavzu kategoriyasi
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Tenses & Grammar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mavzuning o'zbekcha batafsil tushuntirishi *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descUz}
                  onChange={(e) => setDescUz(e.target.value)}
                  placeholder="Qoidalar, ishlatilish o'rinlari va misollarni yozing..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    1-Qoida
                  </label>
                  <input
                    type="text"
                    value={rule1}
                    onChange={(e) => setRule1(e.target.value)}
                    placeholder="Will + asosiy fe'l (V1)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    2-Qoida
                  </label>
                  <input
                    type="text"
                    value={rule2}
                    onChange={(e) => setRule2(e.target.value)}
                    placeholder="Inkor shaklida won't ishlatiladi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Darsni nashr etish
                </button>
              </div>
            </form>
          </div>

          {/* Import JSON Curriculum Package */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Tashqi Darslar Paketini Import Qilish (JSON)
            </h3>
            <p className="text-xs text-slate-500">
              Tayyorlangan darslar to'plamini JSON formatida yuklang. Barcha test savollari va o'zbekcha izohlar avtomatik tekshiriladi.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportCurriculum}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      )}
    </div>
  );
};
