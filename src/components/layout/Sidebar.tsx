import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Bot,
  FileCheck,
  Layers,
  Mic,
  Award,
  BookMarked,
  BarChart3,
  Settings,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse
}) => {
  const { activeNav, setActiveNav, targetLanguage, stats } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Grammatika kurslari', icon: GraduationCap },
    { id: 'dictionary', label: "Lug'at va Xotira", icon: BookOpen },
    { id: 'tutor', label: 'AI Tyutor & Suhbatlar', icon: Bot, isSpecial: true },
    { id: 'checker', label: 'Matn tekshirgich', icon: FileCheck },
    { id: 'pronunciation', label: 'Talaffuz trenajyori', icon: Mic, isSpecial: true },
    { id: 'vocabulary', label: 'Lug\'at trenajyori', icon: Layers, badge: stats.dueReviewsCount > 0 ? stats.dueReviewsCount : undefined },
    { id: 'exams', label: 'Testlar va imtihonlar', icon: Award },
    { id: 'reading', label: 'Mutolaa rejimi', icon: BookMarked },
    { id: 'statistics', label: 'Statistika', icon: BarChart3 },
    { id: 'profile', label: 'Profil va sozlamalar', icon: Settings },
    { id: 'admin', label: 'Admin boshqaruvi', icon: ShieldCheck }
  ];

  const handleSelectNav = (id: string) => {
    setActiveNav(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-64'}`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <span className="font-extrabold text-lg tracking-wider">L</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5">
                  Lingua AI
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili'} kursi
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={isCollapsed ? "Kengaytirish" : "Kichraytirish"}
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : item.isSpecial
                      ? 'text-indigo-500 group-hover:text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer mini-card */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 m-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Oflayn tayyor
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Grammatika, lug'at va kartochkalar internetsiz ham ishlaydi.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
