import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { DictionaryEntry, LibraryMemoryItem } from '../../types';
import { searchDictionaryEntries } from '../../utils/dictionarySearch';
import { searchLibraryMemory } from '../../utils/librarySearch';
import { speakPhrase } from '../../utils/speech';
import { formatPronunciation } from '../../utils/pronunciation';
import {
  Search,
  BookOpen,
  Volume2,
  Star,
  Plus,
  Download,
  Upload,
  Filter,
  Check,
  Trash2,
  BookmarkPlus,
  Sparkles,
  Info,
  X,
  Globe,
  Database,
  Layers,
  Library,
  ArrowRight
} from 'lucide-react';

export const DictionaryView: React.FC = () => {
  const { targetLanguage, globalSearchQuery, setGlobalSearchQuery, refreshStats, isOnline } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dictionary' | 'library'>('dictionary');
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryMemoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [selectedPos, setSelectedPos] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Online Search State
  const [onlineSearching, setOnlineSearching] = useState(false);
  const [onlineResult, setOnlineResult] = useState<{
    term: string;
    translationUz: string;
    partOfSpeech: string;
    pronunciation?: string;
    examples: { original: string; uzbek: string }[];
    synonyms?: string[];
    explanation?: string;
  } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Word Form State
  const [newTerm, setNewTerm] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newPos, setNewPos] = useState('noun');
  const [newPronunciation, setNewPronunciation] = useState('');
  const [newExampleEn, setNewExampleEn] = useState('');
  const [newExampleUz, setNewExampleUz] = useState('');

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  const loadEntries = async () => {
    setLoading(true);
    try {
      const all = await db.dictionary.filter((e) => e.language === targetLanguage).toArray();
      setEntries(all);

      const mem = await db.libraryMemory.filter((m) => m.language === targetLanguage).toArray();
      setLibraryItems(mem);
    } catch (err) {
      console.error('Failed to load dictionary/library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [targetLanguage]);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  const filteredEntries = searchDictionaryEntries(entries, searchQuery, {
    language: targetLanguage,
    partOfSpeech: selectedPos,
    favoritesOnly
  });

  const filteredLibrary = searchLibraryMemory(libraryItems, searchQuery, targetLanguage).filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const toggleFavorite = async (entry: DictionaryEntry) => {
    const updated = !entry.isFavorite;
    await db.dictionary.update(entry.id, { isFavorite: updated });
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, isFavorite: updated } : e))
    );
  };

  const handleAddToFlashcards = async (entry: DictionaryEntry) => {
    try {
      const cardId = `fc-${entry.id}`;
      const existing = await db.flashcards.get(cardId);
      if (existing) {
        showToast("Bu so'z allaqachon kartochkalaringizda mavjud!");
        return;
      }

      await db.flashcards.add({
        id: cardId,
        dictionaryEntryId: entry.id,
        language: entry.language,
        term: entry.term,
        translation: entry.uzbekTranslation,
        exampleSentence: entry.examples[0]?.original,
        exampleUzbek: entry.examples[0]?.uzbek,
        pronunciation: entry.pronunciation,
        interval: 1,
        repetition: 0,
        efactor: 2.5,
        dueDate: new Date().toISOString(),
        timesReviewed: 0,
        lapses: 0,
        state: 'new'
      });

      refreshStats();
      showToast("So'z muvaffaqiyatli takrorlash kartochkalariga qo'shildi! 🗂️");
    } catch (err) {
      console.error('Error adding to flashcards:', err);
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newTranslation.trim()) return;

    const newEntry: DictionaryEntry = {
      id: `custom-${Date.now()}`,
      language: targetLanguage,
      term: newTerm.trim(),
      uzbekTranslation: newTranslation.trim(),
      partOfSpeech: newPos,
      pronunciation: newPronunciation.trim() || undefined,
      examples: newExampleEn
        ? [{ original: newExampleEn.trim(), uzbek: newExampleUz.trim() }]
        : [],
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    await db.dictionary.add(newEntry);
    setEntries((prev) => [newEntry, ...prev]);
    setShowAddModal(false);
    setNewTerm('');
    setNewTranslation('');
    setNewPronunciation('');
    setNewExampleEn('');
    setNewExampleUz('');
    refreshStats();
    showToast("Yangi so'z lug'at xotirasiga muvaffaqiyatli kiritildi!");
  };

  // Perform Online Search via Server API
  const handlePerformOnlineSearch = async () => {
    if (!searchQuery.trim() || onlineSearching) return;
    setOnlineSearching(true);
    setOnlineResult(null);

    try {
      const prompt = `Foydalanuvchi quyidagi ${langTitle} so'z/iborasi bo'yicha lug'at ma'lumotini qidirmoqda: "${searchQuery}".
Ushbu so'z bo'yicha to'liq o'zbekcha lug'at tahlilini bering:
1. So'z yoki ibora: "${searchQuery}"
2. O'zbekcha aniq tarjimasi
3. So'z turkumi (ot, fe'l, sifat, ravish, ibora)
4. Transkripsiyasi (lotin fonetikasida)
5. 2 ta misol gap (${langTitle}da va o'zbekcha tarjimasi bilan)
6. Sinonimlari`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          targetLanguage,
          mode: 'explain'
        })
      });

      const data = await res.json();
      setOnlineResult({
        term: searchQuery.trim(),
        translationUz: "Onlayn qidiruv tahlili",
        partOfSpeech: 'phrase',
        explanation: data.text || "Natija topildi.",
        examples: [],
        synonyms: []
      });
    } catch (e: any) {
      showToast("Onlayn qidiruvda xatolik yuz berdi");
    } finally {
      setOnlineSearching(false);
    }
  };

  const handleSaveOnlineResultToDb = async () => {
    if (!onlineResult) return;
    const newEntry: DictionaryEntry = {
      id: `online-saved-${Date.now()}`,
      language: targetLanguage,
      term: onlineResult.term,
      uzbekTranslation: "Onlayn qidiruvdan saqlandi",
      partOfSpeech: 'phrase',
      examples: [{ original: onlineResult.term, uzbek: onlineResult.explanation?.slice(0, 80) || '' }],
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    await db.dictionary.add(newEntry);
    setEntries((prev) => [newEntry, ...prev]);
    showToast("So'z doimiy oflayn xotiraga saqlandi! 💾");
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-dictionary-${targetLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(parsed)) {
          alert("Xato fayl formati: JSON massiv bo'lishi kerak.");
          return;
        }

        const validEntries: DictionaryEntry[] = parsed.map((item, idx) => ({
          id: item.id || `import-${Date.now()}-${idx}`,
          language: targetLanguage,
          term: item.term || item.word || 'Unknown',
          uzbekTranslation: item.uzbekTranslation || item.translation || '',
          partOfSpeech: item.partOfSpeech || 'noun',
          pronunciation: item.pronunciation,
          examples: item.examples || [],
          synonyms: item.synonyms || [],
          isCustom: true
        }));

        await db.dictionary.bulkPut(validEntries);
        await loadEntries();
        refreshStats();
        setShowImportExportModal(false);
        showToast(`${validEntries.length} ta so'z muvaffaqiyatli import qilindi!`);
      } catch (err: any) {
        alert("JSON faylni o'qishda xatolik: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{flag}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {langTitle} — Oflayn Lug'at va Bilimlar Kutubxonasi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Qurilma xotirasidagi minglab so'zlar va iboralar. Oflayn qidiruv yoki onlayn internetdan izlash.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>So'z qo'shish</span>
          </button>
          <button
            onClick={() => setShowImportExportModal(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
            title="Import / Eksport"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Switcher: Dictionary vs Library Memory */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'dictionary'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lug'at Xotirasi ({entries.length} ta so'z)</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'library'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>📚 Bilimlar Kutubxonasi ({libraryItems.length} ta mavzu)</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="So'zni kiriting (inglizcha, ruscha yoki o'zbekcha)..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Online Search Button */}
          <button
            onClick={handlePerformOnlineSearch}
            disabled={!searchQuery.trim() || onlineSearching}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0"
            title="Internet va Gemini orqali qidirish"
          >
            {onlineSearching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Internetdan izlanmoqda...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Onlayn qidirish</span>
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'dictionary' ? (
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-slate-400 font-bold">Turkumi:</span>
              {['all', 'noun', 'verb', 'adjective', 'adverb', 'phrase'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPos(pos)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    selectedPos === pos
                      ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pos === 'all' ? 'Barchasi' : pos}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium transition-all ${
                favoritesOnly
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Sevimlilar ({entries.filter((e) => e.isFavorite).length})</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
            <span className="text-slate-400 font-bold">Kategoriya:</span>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'phrasebook', label: 'Muloqot iboralari' },
              { id: 'grammar_rule', label: 'Grammatika qoidalari' },
              { id: 'idiom', label: 'Idiomalar' },
              { id: 'dialogue', label: 'Dialoglar' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Online Search Result Card */}
      {onlineResult && (
        <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 shadow-sm space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                Internet / Onlayn Tahlil Natijasi: "{onlineResult.term}"
              </h3>
            </div>
            <button
              onClick={() => setOnlineResult(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {onlineResult.explanation}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleSaveOnlineResultToDb}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Oflayn xotiraga saqlash</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: DICTIONARY ENTRIES */}
      {activeTab === 'dictionary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-blue-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {entry.term}
                      </h3>
                      {entry.pronunciation && (
                        <span className="text-xs font-mono text-slate-400">
                          {formatPronunciation(entry.pronunciation)}
                        </span>
                      )}
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {entry.partOfSpeech}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakPhrase(entry.term, targetLanguage)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                      title="Talaffuzni eshitish"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(entry)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors"
                      title="Sevimlilarga qo'shish"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          entry.isFavorite ? 'fill-amber-500 text-amber-500' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Uzbek translation */}
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {entry.uzbekTranslation}
                </div>

                {/* Examples */}
                {entry.examples && entry.examples.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {entry.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="text-xs text-slate-600 dark:text-slate-300">
                        <p className="italic font-medium">"{ex.original}"</p>
                        <p className="text-[11px] text-slate-400">— {ex.uzbek}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Synonyms */}
                {entry.synonyms && entry.synonyms.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Sinonimlar:</span>
                    {entry.synonyms.map((syn, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleAddToFlashcards(entry)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Kartochkalarga qo'shish</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIBRARY KNOWLEDGE MEMORY */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLibrary.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 uppercase">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.topic}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.titleUz}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 italic">
                      {item.original} — {item.translationUz}
                    </p>
                  </div>

                  <button
                    onClick={() => speakPhrase(item.original, targetLanguage)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                    title="Eshitish"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {item.explanationUz}
                </div>

                {item.examples && item.examples.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Misollar va iboralar:
                    </span>
                    <div className="space-y-1">
                      {item.examples.map((ex, exIdx) => (
                        <div key={exIdx} className="text-xs">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            • {ex.original}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 pl-3">
                            — {ex.uzbek}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredLibrary.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Library className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Kutubxonadan mos keluvchi mavzu topilmadi
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Qidiruv so'zini o'zgartirib ko'ring yoki yuqoridagi "Onlayn qidirish" tugmasidan foydalaning.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state for Dictionary */}
      {activeTab === 'dictionary' && filteredEntries.length === 0 && !loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            "{searchQuery}" bo'yicha mahalliy lug'atda so'z topilmadi
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Yuqoridagi <strong>"Onlayn qidirish"</strong> tugmasini bosib, ushbu so'zni internetdan qidirishingiz va bir bosishda oflayn xotiraga saqlab olishingiz mumkin.
          </p>
          <button
            onClick={handlePerformOnlineSearch}
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Internetdan qidirish (Onlayn)
          </button>
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Yangi so'z qo'shish ({langTitle})
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  So'z ({targetLanguage.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  required
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Masalan: persistent"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  O'zbekcha tarjimasi *
                </label>
                <input
                  type="text"
                  required
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="Masalan: qat'iyatli, tirishqoq"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    So'z turkumi
                  </label>
                  <select
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="noun">Ot (noun)</option>
                    <option value="verb">Fe'l (verb)</option>
                    <option value="adjective">Sifat (adjective)</option>
                    <option value="adverb">Ravish (adverb)</option>
                    <option value="phrase">Ibora (phrase)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Transkripsiya
                  </label>
                  <input
                    type="text"
                    value={newPronunciation}
                    onChange={(e) => setNewPronunciation(e.target.value)}
                    placeholder="[per-sis-tuhnt]"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Misol gap ({targetLanguage.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={newExampleEn}
                  onChange={(e) => setNewExampleEn(e.target.value)}
                  placeholder="He is persistent in his studies."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Misol gapning o'zbekcha tarjimasi
                </label>
                <input
                  type="text"
                  value={newExampleUz}
                  onChange={(e) => setNewExampleUz(e.target.value)}
                  placeholder="U o'qishda juda qat'iyatli."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  Xotiraga saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import / Export Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lug'atni Import va Eksport qilish
              </h2>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Lug'at zaxirasini yuklab olish (Export)
                </h3>
                <p>Hozirgi barcha {entries.length} ta so'zni JSON fayl sifatida yuklab oling.</p>
                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON yuklab olish</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Yangi so'zlar to'plamini yuklash (Import)
                </h3>
                <p>JSON fayl orqali tayyor lug'at bazasini IndexedDB ga yuklang.</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
