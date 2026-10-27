import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { Flashcard, ReviewRating } from '../../types';
import { calculateSM2 } from '../../utils/sm2';
import { speakPhrase } from '../../utils/speech';
import {
  Layers,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Keyboard,
  Shuffle,
  Sparkles,
  Download,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';

export const VocabularyView: React.FC = () => {
  const { targetLanguage, refreshStats } = useLanguage();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeTab, setActiveTab] = useState<'cards' | 'typing' | 'match'>('cards');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedSession, setCompletedSession] = useState(false);

  // Typing practice state
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Matching game state
  const [matchingCards, setMatchingCards] = useState<{ id: string; text: string; matchId: string; type: 'term' | 'trans' }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  useEffect(() => {
    loadCards();
  }, [targetLanguage]);

  const loadCards = async () => {
    try {
      const all = await db.flashcards.filter((f) => f.language === targetLanguage).toArray();
      setCards(all);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompletedSession(false);
      initMatchingGame(all);
    } catch (err) {
      console.warn('Error loading flashcards:', err);
    }
  };

  const initMatchingGame = (cardList: Flashcard[]) => {
    const subset = cardList.slice(0, 6);
    const pool: { id: string; text: string; matchId: string; type: 'term' | 'trans' }[] = [];
    subset.forEach((c) => {
      pool.push({ id: `t-${c.id}`, text: c.term, matchId: c.id, type: 'term' });
      pool.push({ id: `tr-${c.id}`, text: c.translation, matchId: c.id, type: 'trans' });
    });
    // Shuffle
    pool.sort(() => Math.random() - 0.5);
    setMatchingCards(pool);
    setMatchedPairs([]);
    setSelectedMatch(null);
  };

  const currentCard = cards[currentIndex];

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard) return;

    const result = calculateSM2(currentCard, rating);
    const updatedCard: Flashcard = {
      ...currentCard,
      interval: result.interval,
      repetition: result.repetition,
      efactor: result.efactor,
      dueDate: result.dueDate,
      lapses: result.lapses,
      state: result.state,
      timesReviewed: currentCard.timesReviewed + 1,
      lastReviewedDate: new Date().toISOString()
    };

    await db.flashcards.put(updatedCard);

    // Update activity log for today
    const today = new Date().toISOString().split('T')[0];
    const log = await db.activityLog.get(today);
    if (log) {
      await db.activityLog.update(today, { wordsReviewed: log.wordsReviewed + 1 });
    } else {
      await db.activityLog.put({
        date: today,
        wordsReviewed: 1,
        lessonsCompleted: 0,
        timeSpentSeconds: 60
      });
    }

    refreshStats();

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setTypingInput('');
      setTypingFeedback(null);
    } else {
      setCompletedSession(true);
    }
  };

  const handleCheckTyping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !typingInput.trim()) return;

    const isMatch = typingInput.trim().toLowerCase() === currentCard.term.trim().toLowerCase();
    setTypingFeedback(isMatch ? 'correct' : 'wrong');

    if (isMatch) {
      setTimeout(() => {
        handleRate(3); // Rate Good on correct
      }, 1000);
    }
  };

  const handleMatchCardClick = (idx: number) => {
    if (selectedMatch === null) {
      setSelectedMatch(idx);
    } else {
      const first = matchingCards[selectedMatch];
      const second = matchingCards[idx];

      if (first.id !== second.id && first.matchId === second.matchId) {
        // Matched!
        setMatchedPairs((prev) => [...prev, first.matchId]);
      }
      setSelectedMatch(null);
    }
  };

  const handleExportFlashcards = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-flashcards-${targetLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{flag}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Lug'at Trenajyori (SM-2 Spaced Repetition)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            SuperMemo-2 algoritmi asosidagi ilmiy intervalli takrorlash va interaktiv so'z mashqlari.
          </p>
        </div>

        <button
          onClick={handleExportFlashcards}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Zaxiralash (Export)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cards'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcardlar ({cards.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('typing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'typing'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Yozish amaliyoti</span>
        </button>
        <button
          onClick={() => setActiveTab('match')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'match'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Moslashtirish o'yini</span>
        </button>
      </div>

      {/* FLASHCARD MODE */}
      {activeTab === 'cards' && (
        <div className="max-w-xl mx-auto space-y-6">
          {!completedSession && currentCard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-2">
                <span>
                  Kartochka {currentIndex + 1} / {cards.length}
                </span>
                <span className="capitalize font-mono">
                  Holat: {currentCard.state} | Takrorlash: {currentCard.repetition}
                </span>
              </div>

              {/* Flip Card Surface */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-72 p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between text-center select-none"
              >
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakPhrase(currentCard.term, targetLanguage);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Talaffuz"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 my-auto">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {currentCard.term}
                  </div>
                  {currentCard.pronunciation && (
                    <div className="text-sm font-mono text-slate-400">
                      {currentCard.pronunciation}
                    </div>
                  )}

                  {isFlipped ? (
                    <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {currentCard.translation}
                      </div>
                      {currentCard.exampleSentence && (
                        <p className="text-xs italic text-slate-600 dark:text-slate-300">
                          "{currentCard.exampleSentence}"
                        </p>
                      )}
                      {currentCard.exampleUzbek && (
                        <p className="text-[11px] text-slate-400">
                          — {currentCard.exampleUzbek}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 pt-2">
                      Tarjimani ko'rish uchun kartani bosing 👆
                    </p>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  {isFlipped ? 'Baholash uchun quyidagi tugmalardan birini bosing' : 'Orqa tomonini ochish'}
                </div>
              </div>

              {/* SM-2 Review Rating Controls */}
              {isFlipped ? (
                <div className="grid grid-cols-4 gap-2.5 pt-2 animate-in fade-in">
                  <button
                    onClick={() => handleRate(1)}
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold text-xs border border-red-200 dark:border-red-900 transition-colors flex flex-col items-center gap-1"
                  >
                    <span>Again</span>
                    <span className="text-[10px] font-normal opacity-80">1 kun</span>
                  </button>
                  <button
                    onClick={() => handleRate(2)}
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900 transition-colors flex flex-col items-center gap-1"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] font-normal opacity-80">3 kun</span>
                  </button>
                  <button
                    onClick={() => handleRate(3)}
                    className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-900 transition-colors flex flex-col items-center gap-1"
                  >
                    <span>Good</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {Math.max(1, Math.round(currentCard.interval * currentCard.efactor))} kun
                    </span>
                  </button>
                  <button
                    onClick={() => handleRate(4)}
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-900 transition-colors flex flex-col items-center gap-1"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] font-normal opacity-80">
                      {Math.max(2, Math.round(currentCard.interval * currentCard.efactor * 1.3))} kun
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-colors"
                >
                  Javobni ko'rsatish
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Award className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Bugungi takrorlash sessiyasi yakunlandi! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Barcha kartochkalar SM-2 intervalli jadvali bo'yicha saqlandi. Yangi so'zlar qo'shish uchun lug'at bo'limidan foydalaning.
              </p>
              <button
                onClick={loadCards}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Qaytadan boshlash
              </button>
            </div>
          )}
        </div>
      )}

      {/* TYPING PRACTICE MODE */}
      {activeTab === 'typing' && currentCard && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              O'zbekcha tarjimasi:
            </span>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {currentCard.translation}
            </h3>
          </div>

          <form onSubmit={handleCheckTyping} className="space-y-3 pt-2">
            <input
              type="text"
              autoFocus
              value={typingInput}
              onChange={(e) => setTypingInput(e.target.value)}
              placeholder={`${langTitle}da to'g'ri yozilishini kiriting...`}
              className="w-full px-4 py-3 text-center text-sm font-semibold rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {typingFeedback === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 text-xs font-bold animate-in zoom-in-95">
                ✓ Barakalla! To'g'ri yozildi.
              </div>
            )}
            {typingFeedback === 'wrong' && (
              <div className="p-3 rounded-xl bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 text-xs font-bold animate-in zoom-in-95">
                ✗ Xato. To'g'ri javob: <strong>{currentCard.term}</strong>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Tekshirish
            </button>
          </form>
        </div>
      )}

      {/* MATCHING PAIRS GAME */}
      {activeTab === 'match' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>So'z va uning tarjimasini bir-biriga moslashtiring:</span>
            <span>Moslashgan juftliklar: {matchedPairs.length} / {matchingCards.length / 2}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {matchingCards.map((card, idx) => {
              const isMatched = matchedPairs.includes(card.matchId);
              const isSelected = selectedMatch === idx;

              return (
                <button
                  key={card.id}
                  disabled={isMatched}
                  onClick={() => handleMatchCardClick(idx)}
                  className={`p-4 rounded-2xl border text-xs font-bold transition-all min-h-20 flex items-center justify-center text-center shadow-xs ${
                    isMatched
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 opacity-60'
                      : isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 scale-102 ring-2 ring-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-300'
                  }`}
                >
                  {card.text}
                </button>
              );
            })}
          </div>

          {matchedPairs.length === matchingCards.length / 2 && matchingCards.length > 0 && (
            <div className="p-4 text-center bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 space-y-2">
              <p>Tabriklaymiz! Barcha juftliklarni to'g'ri topdingiz! 🏆</p>
              <button
                onClick={() => initMatchingGame(cards)}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs"
              >
                Yana o'ynash
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
