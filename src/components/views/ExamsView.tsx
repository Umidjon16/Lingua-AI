import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { PLACEMENT_QUESTIONS_EN, PLACEMENT_QUESTIONS_RU } from '../../data/placementQuestions';
import { PlacementTestQuestion, PlacementTestResult, CefrLevel } from '../../types';
import { evaluateCefrPlacement } from '../../utils/cefr';
import { speakPhrase } from '../../utils/speech';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Volume2,
  Mic,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  History
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { targetLanguage, setCefrLevel, setActiveNav } = useLanguage();
  const [activeTab, setActiveTab] = useState<'placement' | 'speaking' | 'history'>('placement');

  // Placement Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testFinished, setTestFinished] = useState(false);
  const [result, setResult] = useState<PlacementTestResult | null>(null);
  const [testHistory, setTestHistory] = useState<PlacementTestResult[]>([]);

  // Speaking Pronunciation Practice State
  const [speechRecognized, setSpeechRecognized] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';
  const questions: PlacementTestQuestion[] =
    targetLanguage === 'ru' ? PLACEMENT_QUESTIONS_RU : PLACEMENT_QUESTIONS_EN;

  const currentQ = questions[currentQuestionIndex];

  useEffect(() => {
    loadTestHistory();
  }, [targetLanguage]);

  const loadTestHistory = async () => {
    try {
      const history = await db.placementResults
        .filter((r) => r.language === targetLanguage)
        .reverse()
        .toArray();
      setTestHistory(history);
    } catch (err) {
      console.warn('Error loading placement test history:', err);
    }
  };

  const handleSelectAnswer = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    let score = 0;
    const catScores = { grammar: 0, vocabulary: 0, reading: 0 };
    const catTotals = { grammar: 0, vocabulary: 0, reading: 0 };

    questions.forEach((q) => {
      catTotals[q.category] += 1;
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      if (userAns === q.correctAnswer.trim().toLowerCase()) {
        score += 1;
        catScores[q.category] += 1;
      }
    });

    const evalResult = evaluateCefrPlacement(score, questions.length);

    const testResult: PlacementTestResult = {
      id: `pt-${Date.now()}`,
      language: targetLanguage,
      date: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      estimatedLevel: evalResult.level,
      feedbackUz: evalResult.descriptionUz,
      categoryScores: {
        grammar: catTotals.grammar > 0 ? Math.round((catScores.grammar / catTotals.grammar) * 100) : 0,
        vocabulary: catTotals.vocabulary > 0 ? Math.round((catScores.vocabulary / catTotals.vocabulary) * 100) : 0,
        reading: catTotals.reading > 0 ? Math.round((catScores.reading / catTotals.reading) * 100) : 0
      }
    };

    setResult(testResult);
    setTestFinished(true);

    // Save to DB
    await db.placementResults.add(testResult);
    await loadTestHistory();
  };

  const handleApplyEstimatedLevel = (lvl: CefrLevel) => {
    setCefrLevel(lvl);
    setActiveNav('courses');
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestFinished(false);
    setResult(null);
  };

  // Speech Recognition tester
  const sampleSpeechPhrases = targetLanguage === 'ru'
    ? ['Здравствуйте, приятно познакомиться', 'Я изучаю русский язык каждый день', 'Где находится ближайшая станция метро?']
    : ['Consistency is the key to mastering English', 'Could you please explain this grammar rule?', 'I would like to practice speaking with you'];
  const [activeSpeechPhraseIndex, setActiveSpeechPhraseIndex] = useState(0);
  const targetSpeechPhrase = sampleSpeechPhrases[activeSpeechPhraseIndex];

  const handleStartSpeech = async () => {
    setSpeechError(null);

    // Request actual microphone stream first to ensure permission is active
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream after permission test
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (permErr: any) {
      if (permErr.name === 'NotAllowedError') {
        setSpeechError("Mikrofonga ruxsat berilmadi. Iltimos, brauzer qidiruv qatoridagi qulf belgisidan mikrofonni yoqing.");
        return;
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Brauzeringizda Web Speech qo'llab-quvvatlanmaydi. To'liq audio trenajyorga o'ting.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = targetLanguage === 'ru' ? 'ru-RU' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setSpeechRecognized('');
      setSpeechScore(null);
      setSpeechAnalysis(null);

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechRecognized(transcript);
        setIsRecording(false);
        setIsAnalyzingSpeech(true);

        try {
          const res = await fetch('/api/ai/pronunciation-analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetText: targetSpeechPhrase,
              spokenText: transcript,
              language: targetLanguage
            })
          });
          if (res.ok) {
            const data = await res.json();
            setSpeechScore(data.score);
            setSpeechAnalysis(data);
          } else {
            const expected = targetSpeechPhrase.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
            const actual = transcript.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
            setSpeechScore(expected === actual ? 100 : 75);
          }
        } catch {
          const expected = targetSpeechPhrase.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
          const actual = transcript.toLowerCase().replace(/[^a-zа-я0-9]/g, '');
          setSpeechScore(expected === actual ? 100 : 75);
        } finally {
          setIsAnalyzingSpeech(false);
        }
      };

      recognition.onerror = (err: any) => {
        setIsRecording(false);
        setIsAnalyzingSpeech(false);
        if (err.error === 'not-allowed') {
          // If speech recognition cloud service was blocked, offer shortcut to full pronunciation trainer
          setSpeechError("Ovoz aniqlash tizimi cheklandi. 'To'liq Talaffuz Trenajyori' tugmasini bosing.");
        } else if (err.error === 'no-speech') {
          setSpeechError("Ovoz eshitilmadi. Iltimos, mikrofonga yaqinroq gapiring.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      setIsAnalyzingSpeech(false);
      setSpeechError("Ovoz yozishda xatolik yuz berdi. To'liq Talaffuz Trenajyoriga o'ting.");
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
              {langTitle} Testlar va CEFR Daraja Aniqlash
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Grammatika, so'z boyligi va o'qish qobiliyatingizni aniqlovchi diagnostik daraja testi.
          </p>
        </div>

        {/* Limitation note */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>Diagnostik baholash (rasmiy IELTS/CEFR sertifikati emas).</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('placement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'placement'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Daraja testi ({questions.length} ta savol)</span>
        </button>
        <button
          onClick={() => setActiveTab('speaking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'speaking'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Nutq va Talaffuz mashqi</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Testlar tarixi ({testHistory.length})</span>
        </button>
      </div>

      {/* PLACEMENT TEST VIEW */}
      {activeTab === 'placement' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {!testFinished ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>
                    Savol {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="capitalize">
                    Bo'lim: {currentQ.category} ({currentQ.level})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </h3>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectAnswer(opt)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                >
                  <span>
                    {currentQuestionIndex + 1 === questions.length
                      ? 'Natijani hisoblash'
                      : 'Keyingi savol'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* TEST RESULTS CARD */
            result && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto text-2xl font-black">
                  {result.estimatedLevel}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Sizning baholangan CEFR darajangiz:
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {result.estimatedLevel} Daraja ({result.score}/{result.totalQuestions} ball)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto pt-1 leading-relaxed">
                    {result.feedbackUz}
                  </p>
                </div>

                {/* Category breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-left">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-semibold">Grammatika</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {result.categoryScores.grammar}%
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-semibold">Lug'at boyligi</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {result.categoryScores.vocabulary}%
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 block font-semibold">O'qib tushunish</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {result.categoryScores.reading}%
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleApplyEstimatedLevel(result.estimatedLevel)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    Ushbu darajani qabul qilish va darslarga o'tish
                  </button>
                  <button
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Qaytadan topshirish</span>
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* SPEAKING & PRONUNCIATION PRACTICE */}
      {activeTab === 'speaking' && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase">Talaffuz amaliyoti</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Gapni ovoz chiqarib o'qing va talaffuzni sinang
            </h3>
          </div>

          {/* Phrase to speak */}
          <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              "{targetSpeechPhrase}"
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => speakPhrase(targetSpeechPhrase, targetLanguage)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-xs text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                <Volume2 className="w-4 h-4" />
                <span>Namunani eshitish</span>
              </button>
            </div>
          </div>

          {/* Recording Button */}
          <div className="space-y-3">
            <button
              onClick={handleStartSpeech}
              disabled={isRecording || isAnalyzingSpeech}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : isAnalyzingSpeech
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs text-slate-500">
              {isRecording
                ? "Eshitilmoqda... gapiring"
                : isAnalyzingSpeech
                ? "AI xatolarni tahlil qilmoqda..."
                : "Mikrofonni bosib gapiring"}
            </p>
          </div>

          {speechError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              {speechError}
            </div>
          )}

          {speechRecognized && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3 text-left">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Sizning nutqingiz:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm italic mt-0.5">
                  "{speechRecognized}"
                </p>
              </div>

              {speechScore !== null && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Talaffuz aniqligi:</span>
                  <span className={`text-base font-black ${
                    speechScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {speechScore}%
                  </span>
                </div>
              )}

              {/* Word-by-word error detection badges */}
              {speechAnalysis?.wordsAnalysis && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                    So'zlar bo'yicha tahlil:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {speechAnalysis.wordsAnalysis.map((w: any, idx: number) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded-md font-medium text-xs flex items-center gap-1 ${
                          w.status === 'correct'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {w.status === 'correct' ? '✓' : '✗'} {w.word}
                      </span>
                    ))}
                  </div>

                  {speechAnalysis.summaryUz && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                      💡 {speechAnalysis.summaryUz}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center gap-2 pt-1">
            {sampleSpeechPhrases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSpeechPhraseIndex(idx);
                  setSpeechRecognized('');
                  setSpeechScore(null);
                  setSpeechAnalysis(null);
                }}
                className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  activeSpeechPhraseIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Shortcut to full Pronunciation Trainer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveNav('pronunciation')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-blue-600" />
              <span>To'liq Talaffuz Trenajyoriga o'tish (Tez aytishlar va Fonetika) →</span>
            </button>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {testHistory.map((h) => (
            <div
              key={h.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center">
                  {h.estimatedLevel}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {h.estimatedLevel} Daraja ({h.score}/{h.totalQuestions} to'g'ri)
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(h.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-right font-medium text-slate-500">
                Grammatika: {h.categoryScores.grammar}% | Lug'at: {h.categoryScores.vocabulary}%
              </div>
            </div>
          ))}

          {testHistory.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-12">
              Hozircha topshirilgan testlar tarixi mavjud emas.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
