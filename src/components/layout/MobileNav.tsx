import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LayoutDashboard, GraduationCap, BookOpen, Bot, Layers } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeNav, setActiveNav } = useLanguage();

  const items = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
    { id: 'courses', label: 'Kurslar', icon: GraduationCap },
    { id: 'tutor', label: 'AI Tyutor', icon: Bot, isSpecial: true },
    { id: 'dictionary', label: "Lug'at", icon: BookOpen },
    { id: 'vocabulary', label: 'Kartochkalar', icon: Layers }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-blue-50 dark:bg-blue-950/60 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isSpecial && !isActive ? 'text-indigo-500' : ''}`} />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
