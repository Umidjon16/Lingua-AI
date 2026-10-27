import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import { TutorChatMessage, LibraryMemoryItem, DictionaryEntry } from '../../types';
import { generateOfflineAnswerFromMemory } from '../../utils/librarySearch';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  User,
  ArrowRight,
  Database,
  Globe,
  Download,
  Search
} from 'lucide-react';

export const AiTutorView: React.FC = () => {
  const { targetLanguage, cefrLevel, setShowSetupModal, isOnline } = useLanguage();
  const [messages, setMessages] = useState<TutorChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string>('explain');
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [searchMode, setSearchMode] = useState<'auto' | 'offline_only'>('auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionId = `session-${targetLanguage}`;
  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  // Load chat history from IndexedDB on mount or target language change
  useEffect(() => {
    // Check online AI status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setAiConfigured(Boolean(data.configured)))
      .catch(() => setAiConfigured(false));

    async function loadSavedMessages() {
      try {
        const saved = await db.tutorMessages
          .filter((m) => m.sessionId === sessionId)
          .sortBy('timestamp');

        if (saved && saved.length > 0) {
          setMessages(saved);
        } else {
          // Default greeting
          const welcomeMsg: TutorChatMessage = {
            id: `welcome-${targetLanguage}`,
            sessionId,
            language: targetLanguage,
            role: 'model',
            content: `Assalomu alaykum! Men sizning **${langTitle}** bo'yicha shaxsiy repetitoringizman.\n\nHozirgi darajangiz: **${cefrLevel}**.\nBarcha yozishmalaringiz xotirada saqlanadi. Oflayn holatda javoblar mahalliy kutubxona xotirasi va lug'atdan izlanadi, onlayn holatda esa jonli internet va Gemini intellektidan foydalaniladi!`,
            timestamp: new Date().toISOString(),
            source: 'local_memory'
          };
          await db.tutorMessages.put(welcomeMsg);
          setMessages([welcomeMsg]);
        }
      } catch (err) {
        console.warn('Error loading tutor messages:', err);
      }
    }

    loadSavedMessages();
  }, [targetLanguage, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts: Record<string, string[]> = {
    explain: [
      `${langTitle}da Present Perfect zamoni qoidasini sodda o'zbek tilida tushuntirib bering`,
      `${targetLanguage === 'ru' ? 'Otlarning jinsi (род) qoidasi' : 'Artikllar (a, an, the) ishlatilish tartibi'} haqida dars o'ting`,
      `Eng ko'p chalkashtiriladigan 5 ta grammatik xato haqida yozing`
    ],
    conversation: [
      `Keling, bugungi ish va o'qish haqida ${langTitle}da suhbatlashamiz`,
      `Restoranda taom buyurtma qilish bo'yicha dialog o'tkazaylik`,
      `Menga yangi ish suhbati (interview) uchun savollar bering`
    ],
    correct: [
      `Ushbu gapimni tekshiring: "I am agree with your opinion."`,
      `Gapdagi zamon to'g'rimi: "Yesterday she has went to market."`,
      `Ushbu jumladagi xatoni toping va sababini tushuntiring`
    ],
    study_plan: [
      `Menga 30 kunlik ${cefrLevel} darajadan keyingisiga o'tish rejasi kerak`,
      `Kuniga 20 daqiqa vaqt bilan tilni mustahkamlash strategiyasi`
    ]
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || loading) return;

    const userMsg: TutorChatMessage = {
      id: `user-${Date.now()}`,
      sessionId,
      language: targetLanguage,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    // Save user message immediately to Dexie
    await db.tutorMessages.put(userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const shouldQueryOffline = searchMode === 'offline_only' || !isOnline;

    if (shouldQueryOffline) {
      // Query local offline library memory and dictionary
      try {
        const memoryItems = await db.libraryMemory.toArray();
        const dictEntries = await db.dictionary.filter((d) => d.language === targetLanguage).toArray();
        const offlineResult = generateOfflineAnswerFromMemory(prompt, targetLanguage, memoryItems, dictEntries);

        const botMsg: TutorChatMessage = {
          id: `bot-${Date.now()}`,
          sessionId,
          language: targetLanguage,
          role: 'model',
          content: offlineResult.answerMarkdown,
          timestamp: new Date().toISOString(),
          source: 'local_memory',
          matchedMemoryTitles: offlineResult.matchedItems
        };

        await db.tutorMessages.put(botMsg);
        setMessages((prev) => [...prev, botMsg]);
      } catch (e) {
        console.error('Offline lookup error:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // ONLINE MODE: Call Server Streaming Endpoint for ChatGPT/Gemini-like instant speed
    try {
      // Only send the last 4 messages to keep payload minimal and response immediate
      const recentHistory = messages.slice(-4);
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...recentHistory, userMsg].map((m) => ({
            role: m.role,
            content: m.content
          })),
          targetLanguage,
          level: cefrLevel,
          mode
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming response failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botContent = '';
      let isDemo = false;
      const botId = `bot-${Date.now()}`;

      // Insert placeholder bot message
      setMessages((prev) => [
        ...prev,
        {
          id: botId,
          sessionId,
          language: targetLanguage,
          role: 'model',
          content: '...',
          timestamp: new Date().toISOString(),
          source: 'online_gemini'
        }
      ]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.replace(/^data:\s*/, '').trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              if (botContent === '') {
                botContent = parsed.text;
              } else {
                botContent += parsed.text;
              }
              if (parsed.isDemo) isDemo = true;

              setMessages((prev) =>
                prev.map((m) => (m.id === botId ? { ...m, content: botContent, isDemo } : m))
              );
            }
          } catch {
            // Non-JSON SSE line or malformed, ignore
          }
        }
      }

      // If botContent was empty, retrieve answer from local offline memory
      if (!botContent.trim()) {
        const memoryItems = await db.libraryMemory.toArray();
        const dictEntries = await db.dictionary.filter((d) => d.language === targetLanguage).toArray();
        const offlineResult = generateOfflineAnswerFromMemory(prompt, targetLanguage, memoryItems, dictEntries);
        botContent = offlineResult.answerMarkdown;
        isDemo = true;
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: botContent, isDemo } : m))
        );
      }

      // Final save to IndexedDB once stream completes
      const finalMsg: TutorChatMessage = {
        id: botId,
        sessionId,
        language: targetLanguage,
        role: 'model',
        content: botContent,
        timestamp: new Date().toISOString(),
        isDemo,
        source: isDemo ? 'local_memory' : 'online_gemini'
      };
      await db.tutorMessages.put(finalMsg);
    } catch (err: any) {
      console.warn('Streaming error, falling back to offline memory:', err);
      // Automatic seamless fallback to local memory if network fails
      try {
        const memoryItems = await db.libraryMemory.toArray();
        const dictEntries = await db.dictionary.filter((d) => d.language === targetLanguage).toArray();
        const offlineResult = generateOfflineAnswerFromMemory(prompt, targetLanguage, memoryItems, dictEntries);

        const botMsg: TutorChatMessage = {
          id: `bot-fallback-${Date.now()}`,
          sessionId,
          language: targetLanguage,
          role: 'model',
          content: offlineResult.answerMarkdown + "\n\n*(Tarmoqdagi uzilish sababli javob oflayn xotiradan berildi)*",
          timestamp: new Date().toISOString(),
          source: 'local_memory'
        };

        await db.tutorMessages.put(botMsg);
        setMessages((prev) => [...prev.filter((m) => !m.id.startsWith('bot-')), botMsg]);
      } catch (inner) {
        console.error(inner);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (confirm("Ushbu til bo'yicha yozishmalar tarixini butunlay tozalashni xohlaysizmi?")) {
      const ids = messages.map((m) => m.id);
      await db.tutorMessages.bulkDelete(ids);
      const welcomeMsg: TutorChatMessage = {
        id: `welcome-${targetLanguage}-${Date.now()}`,
        sessionId,
        language: targetLanguage,
        role: 'model',
        content: `Suhbat tozalandi. Yangi savolingizni yozing — oflayn yoki onlayn rejimda javob berishga tayyorman!`,
        timestamp: new Date().toISOString(),
        source: 'local_memory'
      };
      await db.tutorMessages.put(welcomeMsg);
      setMessages([welcomeMsg]);
    }
  };

  const handleExportChat = () => {
    const textContent = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'Foydalanuvchi' : 'AI Tyutor'}:\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingua-ai-chat-${targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner / Mode selector */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Lingua AI Repetitor
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {flag} {langTitle} ({cefrLevel})
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Yozishmalar xotirada saqlanadi | Oflayn kutubxona & Onlayn qidiruv
            </span>
          </div>
        </div>

        {/* Action Controls & Mode switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Online/Offline Search Mode Switcher */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setSearchMode('auto')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                searchMode === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Onlayn bo'lsa internet/Gemini, oflayn bo'lsa xotiradan izlaydi"
            >
              <Globe className="w-3 h-3" />
              <span>Avto (Onlayn/Oflayn)</span>
            </button>
            <button
              onClick={() => setSearchMode('offline_only')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                searchMode === 'offline_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Faqat ichki IndexedDB kutubxona xotirasidan javob topadi"
            >
              <Database className="w-3 h-3" />
              <span>Faqat Xotiradan</span>
            </button>
          </div>

          <button
            onClick={handleExportChat}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Yozishmalarni yuklab olish (TXT)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Suhbatni tozalash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modes bar */}
      <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        {[
          { id: 'explain', label: 'Mavzuni tushuntir' },
          { id: 'conversation', label: 'Suhbat amaliyoti' },
          { id: 'correct', label: 'Gapimni tekshir' },
          { id: 'study_plan', label: "O'qish rejasi" }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              mode === m.id
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {/* Source Badge */}
                {!isUser && (
                  <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                    {msg.source === 'local_memory' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        <Database className="w-3 h-3" /> Oflayn xotiradan topildi
                      </span>
                    )}
                    {msg.source === 'online_gemini' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                        <Globe className="w-3 h-3" /> Onlayn intellekt (Gemini 3.8)
                      </span>
                    )}
                    {msg.isDemo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3 h-3" /> Demo javob
                      </span>
                    )}
                  </div>
                )}

                <div>{msg.content}</div>

                <div
                  className={`text-[10px] mt-1.5 text-right font-medium ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>
                {searchMode === 'offline_only' || !isOnline
                  ? "Mahalliy xotira va lug'atdan qidirilmoqda..."
                  : "Onlayn intellekt tahlil qilmoqda..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      {quickPrompts[mode] && (
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Namuna:</span>
          {quickPrompts[mode].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-[11px] px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:border-blue-400 whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            searchMode === 'offline_only' || !isOnline
              ? "Oflayn xotiradan so'z yoki qoidani so'rang..."
              : "Savolingizni yoki mashq matnini yozing..."
          }
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2.5 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <span className="hidden sm:inline">Yuborish</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
