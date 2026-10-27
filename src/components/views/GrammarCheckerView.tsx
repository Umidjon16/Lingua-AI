import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { WritingCheckRecord } from '../../types';
import {
  FileCheck,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  History,
  Trash2,
  Info,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  PenTool,
  Target,
  Award,
  Edit3,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface SentenceChallenge {
  id: string;
  type: 'words' | 'translation' | 'grammar';
  title: string;
  requiredWords?: string[];
  promptUz?: string;
  instructionsUz: string;
  sampleIdeaUz?: string;
  grammarRule?: string;
}

export const GrammarCheckerView: React.FC = () => {
  const { targetLanguage, cefrLevel } = useLanguage();
  
  // Active mode: 'builder' (user writes own sentence based on challenges) or 'free' (free text checking)
  const [activeTab, setActiveTab] = useState<'builder' | 'free'>('builder');

  // Input states
  const [builderText, setBuilderText] = useState('');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingCheckRecord | null>(null);
  const [history, setHistory] = useState<WritingCheckRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Today's words and AI sentence challenges
  const [studiedWords, setStudiedWords] = useState<string[]>([]);
  const [studiedTopics, setStudiedTopics] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<SentenceChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<SentenceChallenge | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  const sampleTexts: Record<string, string[]> = {
    en: [
      "Yesterday I go to market and buyed two book, but it was very expensive.",
      "She do not likes to eating fast food because it make people unhealthy.",
      "If I will have time tomorrow, I am going visit my grandparents."
    ],
    ru: [
      "Вчера я пойти в магазин и купил интересная книга.",
      "Она не любит кушать фастфуд, потому что это вредно.",
      "Если я буду иметь свободное время, я пойду в парк."
    ]
  };

  useEffect(() => {
    loadHistory();
    loadStudiedContent();
  }, [targetLanguage]);

  const loadHistory = async () => {
    try {
      const records = await db.writingChecks
        .filter((r) => r.language === targetLanguage)
        .reverse()
        .limit(6)
        .toArray();
      setHistory(records);
    } catch (err) {
      console.warn('Error loading check history:', err);
    }
  };

  const loadStudiedContent = async () => {
    try {
      const dictWords = await db.dictionary
        .filter((d) => d.language === targetLanguage)
        .limit(12)
        .toArray();
      const flashcards = await db.flashcards
        .filter((f) => f.language === targetLanguage)
        .limit(8)
        .toArray();

      const combinedWords = Array.from(
        new Set([
          ...dictWords.map((d) => d.term),
          ...flashcards.map((f) => f.term)
        ])
      ).filter(Boolean);

      const wordsToUse = combinedWords.length > 0 
        ? combinedWords 
        : (targetLanguage === 'ru' ? ['книга', 'работа', 'время', 'говорить', 'учить'] : ['practice', 'challenge', 'achieve', 'improve', 'fluent']);
      setStudiedWords(wordsToUse);

      const memoryTopics = await db.libraryMemory
        .filter((m) => m.language === targetLanguage)
        .limit(5)
        .toArray();
      const topicsToUse = memoryTopics.map((m) => m.topic);
      setStudiedTopics(topicsToUse);

      // Auto load challenges based on today's words
      fetchChallenges(wordsToUse, topicsToUse);
    } catch (err) {
      console.warn('Error loading studied content:', err);
    }
  };

  const fetchChallenges = async (words = studiedWords, topics = studiedTopics) => {
    setIsLoadingChallenges(true);
    try {
      const res = await fetch('/api/ai/sentence-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words,
          topics,
          language: targetLanguage,
          level: cefrLevel
        })
      });

      if (!res.ok) throw new Error('Topshiriqlarni yuklashda xatolik yuz berdi');
      const data = await res.json();
      if (data.challenges && data.challenges.length > 0) {
        setChallenges(data.challenges);
        setSelectedChallenge(data.challenges[0]);
      }
    } catch (err) {
      console.error('Sentence challenges error:', err);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  const handleInsertWord = (word: string) => {
    const current = builderText.trim();
    if (!current) {
      setBuilderText(word + ' ');
    } else {
      setBuilderText(current + ' ' + word + ' ');
    }
  };

  const isWordPresent = (word: string, textContent: string) => {
    if (!word || !textContent) return false;
    const cleanWord = word.toLowerCase().trim();
    const cleanText = textContent.toLowerCase();
    return cleanText.includes(cleanWord);
  };

  const handleCheckSentence = async (customText?: string, challengeContext?: SentenceChallenge | null) => {
    const textToCheck = (customText !== undefined ? customText : (activeTab === 'builder' ? builderText : freeText)).trim();
    if (!textToCheck || loading) return;

    setLoading(true);
    setErrorMsg(null);

    const contextToSend = activeTab === 'builder' && challengeContext ? {
      taskType: challengeContext.type,
      taskTitle: challengeContext.title,
      requiredWords: challengeContext.requiredWords,
      promptUz: challengeContext.promptUz,
      grammarRule: challengeContext.grammarRule
    } : undefined;

    try {
      const response = await fetch('/api/ai/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToCheck,
          language: targetLanguage,
          challengeContext: contextToSend
        })
      });

      if (!response.ok) {
        throw new Error('Matnni tahlil qilishda xatolik yuz berdi.');
      }

      const data = await response.json();
      const record: WritingCheckRecord = {
        id: `check-${Date.now()}`,
        language: targetLanguage,
        timestamp: new Date().toISOString(),
        originalText: textToCheck,
        correctedText: data.corrected || textToCheck,
        score: typeof data.score === 'number' ? data.score : 85,
        issues: data.issues || [],
        overallFeedbackUz: data.overallFeedbackUz || 'Matn tahlil qilindi.',
        challengeInfo: data.challengeInfo ? {
          taskTitle: challengeContext?.title,
          taskType: challengeContext?.type,
          requiredWords: challengeContext?.requiredWords,
          taskCompleted: data.challengeInfo.taskCompleted,
          taskFeedbackUz: data.challengeInfo.taskFeedbackUz
        } : undefined
      };

      setResult(record);
      await db.writingChecks.add(record);
      await loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message || "Xizmat bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClearHistory = async () => {
    try {
      const keys = history.map((h) => h.id);
      await db.writingChecks.bulkDelete(keys);
      setHistory([]);
    } catch (err) {
      console.warn('Error clearing history:', err);
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
              {langTitle} Mashq & Grammatika Tekshirgich
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Bugun o'rganilgan so'zlardan o'zingiz gap yozing va AI orqali xatolarni 1 soniyada tahlil qiling.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Gap tuzish trenajyori</span>
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'free'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Erkin matn tekshirish</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Work Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'builder' ? (
            /* ACTIVE SENTENCE BUILDER CHALLENGE */
            <div className="space-y-6">
              {/* Challenge Selection Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Target className="w-4 h-4" />
                      </div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        Bugungi so'zlar bo'yicha gap tuzish topshirig'i
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Topshiriqni tanlang, <span className="font-bold text-indigo-600 dark:text-indigo-400">gapni o'zingiz yozing</span> va AI orqali tekshirib oling!
                    </p>
                  </div>

                  <button
                    onClick={() => fetchChallenges()}
                    disabled={isLoadingChallenges}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChallenges ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>Yangi topshiriqlar</span>
                  </button>
                </div>

                {/* Studied Words Chips */}
                <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> O'rganilgan so'zlar:
                  </span>
                  {studiedWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => handleInsertWord(word)}
                      title="Ushbu so'zni gapga qo'shish"
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-105"
                    >
                      <span>+ {word}</span>
                    </button>
                  ))}
                </div>

                {/* Challenge Cards Option List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2">
                  {challenges.map((c) => {
                    const isSelected = selectedChallenge?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedChallenge(c)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-xs ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                            }`}>
                              {c.type === 'words' ? 'So\'zlar' : c.type === 'translation' ? 'Tarjima' : 'Grammatika'}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <p className={`font-bold line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {c.title}
                          </p>
                          <p className={`text-[11px] mt-1 leading-snug line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {c.instructionsUz}
                          </p>
                        </div>

                        {c.requiredWords && c.requiredWords.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-black/10 dark:border-white/10">
                            {c.requiredWords.map((rw, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {rw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Writing Area Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                {/* Active Challenge Prompt Display */}
                {selectedChallenge && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Tanlangan topshiriq: {selectedChallenge.title}
                      </span>
                      <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                        Mustaqil gap yozing
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      👉 {selectedChallenge.instructionsUz}
                    </p>

                    {selectedChallenge.promptUz && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/50 text-xs">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Tarjima qilinadigan jumla:</span>
                        <p className="font-semibold text-slate-900 dark:text-white italic mt-0.5">
                          "{selectedChallenge.promptUz}"
                        </p>
                      </div>
                    )}

                    {/* Word status checklist indicator */}
                    {selectedChallenge.requiredWords && selectedChallenge.requiredWords.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                        <span className="text-[11px] text-slate-500 font-semibold">Kerakli so'zlar holati:</span>
                        {selectedChallenge.requiredWords.map((word, i) => {
                          const used = isWordPresent(word, builderText);
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 border transition-all ${
                                used
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                              }`}
                            >
                              {used ? <Check className="w-3 h-3 text-emerald-600" /> : <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                              <span>{word}</span>
                              {used && <span className="text-[9px] uppercase font-bold text-emerald-600">kiritildi</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive user sentence text area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>O'zingiz tuzgan gapni kiriting:</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {builderText.length} belgi | {builderText.trim() ? builderText.trim().split(/\s+/).length : 0} so'z
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={builderText}
                    onChange={(e) => setBuilderText(e.target.value)}
                    placeholder={
                      targetLanguage === 'ru'
                        ? "Masalan: Каждый день я стараюсь учить новые слова и говорить свободно..."
                        : "Masalan: I practice English every day to improve my speaking skills..."
                    }
                    className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none transition-all shadow-inner"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  {builderText.trim() ? (
                    <button
                      onClick={() => setBuilderText('')}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Tozalash
                    </button>
                  ) : <div />}

                  <button
                    onClick={() => handleCheckSentence(builderText, selectedChallenge)}
                    disabled={!builderText.trim() || loading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:shadow-blue-500/25"
                  >
                    {loading ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>AI tekshirmoqda...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Gapimni tekshirish (AI)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FREE TEXT CHECKER TAB */
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Erkin matn yoki insho tekshirish
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Istalgan hajmdagi matningizni qo'ying va xatolarni tekshirib oling.
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {freeText.length} belgi | {freeText.trim() ? freeText.trim().split(/\s+/).length : 0} so'z
                </span>
              </div>

              <textarea
                rows={6}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Matningizni shu yerga yozing yoki nusxa ko'chirib qo'ying..."
                className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none"
              />

              {/* Sample pill buttons */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Sinov uchun namunalar:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts[targetLanguage]?.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFreeText(sample)}
                      className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-xs transition-colors cursor-pointer"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleCheckSentence(freeText, null)}
                  disabled={!freeText.trim() || loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Tahlil qilinmoqda...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Grammatikani tekshirish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI CHECK RESULTS CARD */}
          {result && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm ${
                    result.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : result.score >= 70
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {result.score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Tekshiruv natijasi
                      </h3>
                      {result.issues.length === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          Xatosiz a'lo natija! 🎉
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          {result.issues.length} ta xato topildi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Siz tuzgan gap: <span className="font-medium italic text-slate-700 dark:text-slate-300">"{result.originalText}"</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      if (activeTab === 'builder') {
                        setBuilderText(result.correctedText);
                      } else {
                        setFreeText(result.correctedText);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Maydonga ko'chirib tahrirlash"
                  >
                    Tahrirlashga olish
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi!' : 'Nusxalash'}</span>
                  </button>
                </div>
              </div>

              {/* Challenge fulfillment feedback if available */}
              {result.challengeInfo?.taskFeedbackUz && (
                <div className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  result.challengeInfo.taskCompleted
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Topshiriq holati:</span>
                    <p className="mt-0.5">{result.challengeInfo.taskFeedbackUz}</p>
                  </div>
                </div>
              )}

              {/* Corrected Text Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                  ✓ To'g'rilangan tabiiy variant:
                </span>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                  {result.correctedText}
                </p>
              </div>

              {/* Issues Breakdown */}
              {result.issues.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Aniqlangan xatolar va o'zbekcha tushuntirish:
                  </h4>
                  <div className="space-y-2.5">
                    {result.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                            {issue.type}
                          </span>
                          <span className="line-through text-red-600 font-semibold font-mono bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                            {issue.originalSnippet}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {issue.suggestion}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          💡 {issue.explanationUz}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Siz tuzgan gapda grammatik yoki uslubiy xatolik topilmadi. Barakalla!</span>
                </div>
              )}

              {/* Overall Feedback */}
              {result.overallFeedbackUz && (
                <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold block mb-1">AI Tyutor xulosasi:</span>
                  <p>{result.overallFeedbackUz}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Checks History (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  So'nggi tekshiruvlar
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Tarixni tozalash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              O'zingiz tuzgan va tekshirgan gaplar ro'yxati:
            </p>

            <div className="space-y-2.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setResult(item);
                    if (activeTab === 'builder') {
                      setBuilderText(item.originalText);
                    } else {
                      setFreeText(item.originalText);
                    }
                  }}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-300 cursor-pointer transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      item.score >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.score >= 70
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      Ball: {item.score}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium truncate italic">
                    "{item.originalText}"
                  </p>
                  {item.issues && item.issues.length > 0 && (
                    <span className="text-[10px] text-red-500 block">
                      {item.issues.length} ta tuzatish
                    </span>
                  )}
                </div>
              ))}

              {history.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs italic space-y-1">
                  <Info className="w-5 h-5 mx-auto text-slate-300" />
                  <p>Hozircha tekshiruvlar yo'q</p>
                  <p className="text-[11px] text-slate-400">Gap tuzib AI orqali tekshirib ko'ring</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
