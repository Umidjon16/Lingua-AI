import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SetupGuideModal } from './components/modals/SetupGuideModal';

import { DashboardView } from './components/views/DashboardView';
import { CoursesView } from './components/views/CoursesView';
import { DictionaryView } from './components/views/DictionaryView';
import { AiTutorView } from './components/views/AiTutorView';
import { GrammarCheckerView } from './components/views/GrammarCheckerView';
import { VocabularyView } from './components/views/VocabularyView';
import { ExamsView } from './components/views/ExamsView';
import { ReadingView } from './components/views/ReadingView';
import { StatisticsView } from './components/views/StatisticsView';
import { ProfileSettingsView } from './components/views/ProfileSettingsView';
import { AdminView } from './components/views/AdminView';
import { PronunciationView } from './components/views/PronunciationView';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <h2 className="text-lg font-bold text-red-600">Ilovada kutilmagan xatolik yuz berdi</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || "Iltimos, sahifani qayta yuklang."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Sahifani qayta yuklash
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainLayout() {
  const { activeNav } = useLanguage();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardView />;
      case 'courses':
        return <CoursesView />;
      case 'dictionary':
        return <DictionaryView />;
      case 'tutor':
        return <AiTutorView />;
      case 'checker':
        return <GrammarCheckerView />;
      case 'vocabulary':
        return <VocabularyView />;
      case 'pronunciation':
        return <PronunciationView />;
      case 'exams':
        return <ExamsView />;
      case 'reading':
        return <ReadingView />;
      case 'statistics':
        return <StatisticsView />;
      case 'profile':
        return <ProfileSettingsView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <TopBar
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isSidebarOpen={isMobileSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Setup Guide Modal */}
      <SetupGuideModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <MainLayout />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
