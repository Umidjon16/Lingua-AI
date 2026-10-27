import React, { useState } from 'react';
import { Lesson, Question } from '../../types';
import { db } from '../../db/linguaDb';
import { speakPhrase } from '../../utils/speech';
import {
  X,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight
} from 'lucide-react';

interface LessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onCompleted: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose, onCompleted }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
  
  // Quiz state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [selectedWordOrders, setSelectedWordOrders] = useState<Record<string, string[]>>({});

  const handleSelectOption = (questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleFillChange = (questionId: string, val: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleOrderWordClick = (questionId: string, word: string) => {
    if (submitted) return;
    const currentList = selectedWordOrders[questionId] || [];
    if (currentList.includes(word)) {
      // Remove word
      const updated = currentList.filter((w) => w !== word);
      setSelectedWordOrders((prev) => ({ ...prev, [questionId]: updated }));
      setAnswers((prev) => ({ ...prev, [questionId]: updated.join(' ') }));
    } else {
      // Add word
      const updated = [...currentList, word];
      setSelectedWordOrders((prev) => ({ ...prev, [questionId]: updated }));
      setAnswers((prev) => ({ ...prev, [questionId]: updated.join(' ') }));
    }
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    lesson.questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toLowerCase();
      const rightAns = q.correctAnswer.trim().toLowerCase();
      if (userAns === rightAns) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / lesson.questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    // Save to DB
    try {
      const existing = await db.lessonProgress.get(lesson.id);
      const isPass = calculatedScore >= 70;
      await db.lessonProgress.put({
        id: lesson.id,
        lessonId: lesson.id,
        language: lesson.language,
        completed: isPass || existing?.completed || false,
        lastScore: calculatedScore,
        bestScore: Math.max(calculatedScore, existing?.bestScore || 0),
        completedAt: new Date().toISOString(),
        attemptsCount: (existing?.attemptsCount || 0) + 1
      });
      onCompleted();
    } catch (e) {
      console.error('Failed to save lesson progress:', e);
    }
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setSelectedWordOrders({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {lesson.level}
              </span>
              <span className="text-xs text-slate-500">{lesson.topic}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {lesson.titleUz}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{lesson.titleOriginal}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('study')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'study'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Nazariya va Misollar</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Amaliy mashqlar ({lesson.questions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {activeTab === 'study' ? (
            <div className="space-y-6">
              {/* Uzbek explanation */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Mavzu tushuntirishi (O'zbek tilida)
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.descriptionUz}
                </p>
              </div>

              {/* Rules list */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  📌 Asosiy qoidalar
                </h3>
                <div className="space-y-2">
                  {lesson.rulesUz.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples with audio */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  💬 Namunaviy gaplar va talaffuz
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lesson.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1 relative group"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">
                          {ex.original}
                        </span>
                        <button
                          onClick={() => speakPhrase(ex.original, lesson.language)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Eshitish"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {ex.uzbek}
                      </p>
                      {ex.note && (
                        <p className="text-[10px] text-slate-400 italic">
                          Izoh: {ex.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common mistakes */}
              {lesson.commonMistakesUz && lesson.commonMistakesUz.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Keng tarqalgan xatolar va ularning sababi
                  </h3>
                  <div className="space-y-2">
                    {lesson.commonMistakesUz.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through text-red-600 font-mono font-medium">
                            {m.wrong}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                            {m.correct}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 italic">
                          Sababi: {m.reasonUz}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* QUIZ TAB */
            <div className="space-y-6">
              {submitted && score !== null && (
                <div
                  className={`p-4 rounded-2xl border text-center space-y-2 ${
                    score >= 70
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <div className="text-2xl font-black">
                    {score >= 70 ? '🎉 Ajoyib natija!' : '💪 Yaxshi urinish!'}
                  </div>
                  <p className="text-sm font-semibold">
                    To'plangan ball: <span className="font-extrabold">{score}%</span> (
                    {score >= 70 ? "Mavzu muvaffaqiyatli o'zlashtirildi" : "Qayta takrorlash tavsiya etiladi"}
                    )
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {lesson.questions.map((q, idx) => {
                  const userAns = answers[q.id] || '';
                  const isCorrect = submitted && userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                  const isWrong = submitted && !isCorrect;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        submitted
                          ? isCorrect
                            ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800'
                            : 'border-red-300 bg-red-50/30 dark:bg-red-950/20 dark:border-red-800'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {q.promptUz}
                          </p>
                        </div>
                      </div>

                      {/* Multiple choice */}
                      {q.type === 'choice' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt) => {
                            const isSelected = userAns === opt;
                            let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400';
                            if (isSelected) {
                              btnStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold';
                            }
                            if (submitted) {
                              if (opt.toLowerCase() === q.correctAnswer.toLowerCase()) {
                                btnStyle = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle = 'border-red-500 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={submitted}
                                onClick={() => handleSelectOption(q.id, opt)}
                                className={`p-2.5 text-xs rounded-xl border text-left transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill in the blank */}
                      {q.type === 'fill' && (
                        <div className="mt-2">
                          <input
                            type="text"
                            disabled={submitted}
                            value={userAns}
                            onChange={(e) => handleFillChange(q.id, e.target.value)}
                            placeholder="To'g'ri so'zni yozing..."
                            className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Sentence ordering */}
                      {q.type === 'order' && q.wordBank && (
                        <div className="mt-3 space-y-3">
                          {/* Current constructed sentence */}
                          <div className="min-h-10 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap gap-2 items-center">
                            {(selectedWordOrders[q.id] || []).map((word, wIdx) => (
                              <span
                                key={wIdx}
                                onClick={() => handleOrderWordClick(q.id, word)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                {word} ×
                              </span>
                            ))}
                            {(!selectedWordOrders[q.id] || selectedWordOrders[q.id].length === 0) && (
                              <span className="text-xs text-slate-400">
                                Quyidagi so'zlarni bosib tartib bo'yicha tering
                              </span>
                            )}
                          </div>

                          {/* Bank */}
                          <div className="flex flex-wrap gap-2">
                            {q.wordBank.map((word, wIdx) => {
                              const isUsed = (selectedWordOrders[q.id] || []).includes(word);
                              return (
                                <button
                                  key={wIdx}
                                  disabled={submitted || isUsed}
                                  onClick={() => handleOrderWordClick(q.id, word)}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                    isUsed
                                      ? 'opacity-30 bg-slate-100 dark:bg-slate-800 border-slate-300'
                                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                                  }`}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sentence correction */}
                      {q.type === 'correct' && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            disabled={submitted}
                            value={userAns}
                            onChange={(e) => handleFillChange(q.id, e.target.value)}
                            placeholder="To'g'rilangan variantni kiriting..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Explanation when submitted */}
                      {submitted && (
                        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> To'g'ri!
                              </span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Noto'g'ri. To'g'ri javob: <strong>{q.correctAnswer}</strong>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            💡 Izoh: {q.explanationUz}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          {activeTab === 'study' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
              >
                Yopish
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm flex items-center gap-2"
              >
                <span>Mashqlarga o'tish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta boshlash</span>
              </button>
              {!submitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Javoblarni tekshirish</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Darsni yakunlash
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
