import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, CheckCircle2, AlertCircle, Key, Database, Shield, ExternalLink, Copy, Check } from 'lucide-react';

export const SetupGuideModal: React.FC = () => {
  const { showSetupModal, setShowSetupModal } = useLanguage();
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (showSetupModal) {
      setLoading(true);
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => {
          setAiStatus(data);
          setLoading(false);
        })
        .catch(() => {
          setAiStatus({ configured: false, model: 'gemini-3.8-flash' });
          setLoading(false);
        });
    }
  }, [showSetupModal]);

  if (!showSetupModal) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tizim holati va Sozlash qo'llanmasi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lingua AI tashqi integratsiyalari va xavfsizlik konfiguratsiyasi
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSetupModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Gemini AI Status Card */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">1. Gemini AI Integratsiyasi</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  gemini-3.8-flash
                </span>
              </div>
              {loading ? (
                <span className="text-xs text-slate-400">Tekshirilmoqda...</span>
              ) : aiStatus?.configured ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Faol va Ulangan</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Demo rejimida (Kalit ulanmagan)</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {aiStatus?.configured
                ? "Server-side Gemini 3.8 Flash modeli to'liq faol. AI Tyutor va Grammatika tekshirgich jonli intellekt orqali ishlamoqda."
                : "AI Tyutor va Matn tekshirgich hozirda metodik O'zbek tili namunaviy demo rejimida ishlamoqda. Haqiqiy jonli Gemini modeliga ulash uchun quyidagi amallarni bajaring:"}
            </p>

            {!aiStatus?.configured && (
              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono relative">
                <div className="flex justify-between items-center mb-1 text-slate-400">
                  <span>.env yoki AI Studio Secrets</span>
                  <button
                    onClick={() => handleCopy('GEMINI_API_KEY="AIzaSy..."', 'gemini-env')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {copiedKey === 'gemini-env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Nusxa olish</span>
                  </button>
                </div>
                <code>GEMINI_API_KEY="SIZNING_GEMINI_API_KALITINGIZ"</code>
              </div>
            )}
          </div>

          {/* Local IndexedDB Persistence */}
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white">2. Mahalliy Oflayn Baza (IndexedDB / Dexie)</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                100% Faol
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Barcha lug'atlar, shaxsiy kartochkalar, SM-2 takrorlash intervallari, grammatika kurslari va test natijalari brauzeringizning shaxsiy xotirasida saqlanadi. Hech qanday ma'lumot tashqariga chiqmaydi.
            </p>
          </div>

          {/* Cloud Auth / Firebase Guide */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-900 dark:text-white">3. Bulutli Sinxronizatsiya va Firebase</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                Ixtiyoriy
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Platforma ro'yxatdan o'tmasdan (Guest / Mehmon rejimida) to'liq ishlaydi. Agar jamoaviy yoki bir nechta qurilma orasida Firestore sinxronizatsiyasi kerak bo'lsa, Firebase Auth va Firestore loyihasi qo'shilishi mumkin.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={() => setShowSetupModal(false)}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
          >
            Tushundim
          </button>
        </div>
      </div>
    </div>
  );
};
