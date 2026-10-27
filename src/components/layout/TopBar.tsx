import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sun,
  Moon,
  Search,
  Wifi,
  WifiOff,
  Sparkles,
  HelpCircle,
  Menu,
  Languages,
  CheckCircle2,
  ChevronDown,
  User
} from 'lucide-react';
import { CefrLevel } from '../../types';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const {
    targetLanguage,
    setTargetLanguage,
    cefrLevel,
    setCefrLevel,
    theme,
    toggleTheme,
    isOnline,
    setShowSetupModal,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveNav
  } = useLanguage();

  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      setActiveNav('dictionary');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Menyuni ochish"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Lug'atdan so'z izlash..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-full text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setTargetLanguage('en')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              targetLanguage === 'en'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => setTargetLanguage('ru')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              targetLanguage === 'ru'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🇷🇺</span>
            <span>Русский</span>
          </button>
        </div>

        {/* CEFR Level Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLevelMenu(!showLevelMenu)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-lg hover:bg-indigo-100 transition-colors"
            title="Hozirgi CEFR darajangiz"
          >
            <span className="font-bold">{cefrLevel}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showLevelMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CEFR Daraja
              </div>
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setCefrLevel(lvl);
                    setShowLevelMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    cefrLevel === lvl ? 'text-blue-600 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{lvl}</span>
                  {cefrLevel === lvl && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Online / Offline status */}
        <div
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
            isOnline
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
              : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
          }`}
          title={isOnline ? 'Internet mavjud (Onlayn)' : 'Oflayn rejim (Mahalliy baza faol)'}
        >
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline font-medium text-[11px]">{isOnline ? 'Onlayn' : 'Oflayn'}</span>
        </div>

        {/* Setup Guide Button */}
        <button
          onClick={() => setShowSetupModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Tizim holati va API sozlamalari"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden lg:inline text-[11px]">Sozlash</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Mavzuni almashtirish"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setActiveNav('profile')}
          className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Foydalanuvchi profili"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:inline">Mehmon</span>
        </button>
      </div>
    </header>
  );
};
