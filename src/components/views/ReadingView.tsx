import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { READING_TEXTS } from '../../data/readingTexts';
import { ReadingText } from '../../types';
import { db } from '../../db/linguaDb';
import { speakPhrase } from '../../utils/speech';
import {
  BookOpen,
  Volume2,
  BookmarkPlus,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Type,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const ReadingView: React.FC = () => {
  const { targetLanguage, refreshStats } = useLanguage();
  const [selectedTextId, setSelectedTextId] = useState<string>(READING_TEXTS[0]?.id || '');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  
  // Interactive word click popover
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordTranslation, setWordTranslation] = useState<string | null>(null);
  const [wordSaved, setWordSaved] = useState(false);

  // Comprehension questions state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checkedAnswers, setCheckedAnswers] = useState(false);

  const langTexts = READING_TEXTS.filter((t) => t.language === targetLanguage);
  const currentText = langTexts.find((t) => t.id === selectedTextId) || langTexts[0];

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^a-zа-я]/g, '');
    if (!cleanWord || !currentText) return;

    setSelectedWord(cleanWord);
    setWordSaved(false);

    // Look up in glossary or database
    const glossaryMatch = currentText.glossary[cleanWord];
    if (glossaryMatch) {
      setWordTranslation(glossaryMatch);
    } else {
      // Async lookup in DB
      db.dictionary
        .where('term')
        .equalsIgnoreCase(cleanWord)
        .first()
        .then((entry) => {
          if (entry) {
            setWordTranslation(entry.uzbekTranslation);
          } else {
            setWordTranslation("Ushbu so'z matn kontekstiga ko'ra tushuniladi");
          }
        });
    }
  };

  const handleSaveWordToFlashcards = async () => {
    if (!selectedWord || !wordTranslation) return;
    try {
      await db.flashcards.add({
        id: `fc-read-${Date.now()}`,
        language: targetLanguage,
        term: selectedWord,
        translation: wordTranslation,
        interval: 1,
        repetition: 0,
        efactor: 2.5,
        dueDate: new Date().toISOString(),
        timesReviewed: 0,
        lapses: 0,
        state: 'new'
      });
      setWordSaved(true);
      refreshStats();
    } catch (e) {
      console.warn('Error adding word from reading:', e);
    }
  };

  const fontSizeClass = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-loose',
    lg: 'text-base sm:text-lg leading-loose'
  }[fontSize];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧'}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Interaktiv Mutolaa Rejimi (Reading Lab)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Matndagi istalgan so'zni bosing — bir zumda o'zbekcha tarjimasi va lug'atga qo'shish imkoni chiqadi.
          </p>
        </div>

        {/* Font size switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <Type className="w-4 h-4 text-slate-400 mx-1.5" />
          <button
            onClick={() => setFontSize('sm')}
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              fontSize === 'sm' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            A-
          </button>
          <button
            onClick={() => setFontSize('base')}
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              fontSize === 'base' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            A
          </button>
          <button
            onClick={() => setFontSize('lg')}
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              fontSize === 'lg' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
            }`}
          >
            A+
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Texts List (1 col) */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Matnlar ro'yxati
          </span>
          <div className="space-y-2">
            {langTexts.map((text) => (
              <button
                key={text.id}
                onClick={() => {
                  setSelectedTextId(text.id);
                  setSelectedWord(null);
                  setWordTranslation(null);
                  setCheckedAnswers(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  (currentText?.id === text.id)
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {text.level}
                  </span>
                  <span className="text-[11px] text-slate-400">{text.category}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {text.title}
                </h4>
              </button>
            ))}
          </div>
        </div>

        {/* Text Workspace (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {currentText && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Text Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    {currentText.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentText.category}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentText.title}
                </h2>
                <p className="text-xs text-slate-500 italic">
                  💡 O'zbekcha qisqacha mazmuni: {currentText.uzbekSummary}
                </p>
              </div>

              {/* Word click translation popover */}
              {selectedWord && wordTranslation && (
                <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-indigo-900 dark:text-indigo-200 capitalize">
                        {selectedWord}
                      </span>
                      <button
                        onClick={() => speakPhrase(selectedWord, targetLanguage)}
                        className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-md"
                        title="Talaffuz"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ➔ {wordTranslation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveWordToFlashcards}
                      disabled={wordSaved}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      {wordSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Qo'shildi</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Kartochkaga</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWord(null);
                        setWordTranslation(null);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Text content with clickable words */}
              <div className={`${fontSizeClass} text-slate-800 dark:text-slate-200 font-serif`}>
                {currentText.content.split(' ').map((word, wIdx) => {
                  const cleanWord = word.toLowerCase().replace(/[^a-zа-я]/g, '');
                  const hasGlossary = Boolean(currentText.glossary[cleanWord]);
                  const isSelected = selectedWord === cleanWord;

                  return (
                    <span
                      key={wIdx}
                      onClick={() => handleWordClick(word)}
                      className={`inline-block mr-1 px-0.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white font-bold'
                          : hasGlossary
                          ? 'border-b-2 border-indigo-400 text-indigo-900 dark:text-indigo-300 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/40'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Comprehension Questions */}
              {currentText.comprehensionQuestions && currentText.comprehensionQuestions.length > 0 && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    Matnni tushunish bo'yicha savollar (O'zbek tilida)
                  </h3>

                  <div className="space-y-4">
                    {currentText.comprehensionQuestions.map((cq, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
                      >
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {cq.questionUz}
                        </p>
                        <div className="space-y-2">
                          {cq.options.map((opt, oIdx) => {
                            const isChosen = answers[qIdx] === oIdx;
                            let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
                            if (isChosen) {
                              btnStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold';
                            }
                            if (checkedAnswers) {
                              if (oIdx === cq.correctIndex) {
                                btnStyle = 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold';
                              } else if (isChosen) {
                                btnStyle = 'border-red-500 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={checkedAnswers}
                                onClick={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {checkedAnswers && (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            💡 Izoh: {cq.explanationUz}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {!checkedAnswers && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setCheckedAnswers(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                      >
                        Javoblarni tekshirish
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
