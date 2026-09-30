import React from 'react';
import { LayoutDashboard, Sparkles, BookOpen, Bot, Menu } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
  mistakesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
  mistakesCount = 0,
}) => {
  const isMenuTabActive = [
    'pastpapers',
    'mistakes',
    'quizzes',
    'progress',
    'revision',
    'notes',
    'bookmarks',
    'settings',
  ].includes(currentTab);

  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Home',
      icon: LayoutDashboard,
      isActive: currentTab === 'dashboard',
      action: () => onSelectTab('dashboard'),
    },
    {
      id: 'mcqs' as NavTab,
      label: 'MCQs',
      icon: Sparkles,
      isActive: currentTab === 'mcqs',
      action: () => onSelectTab('mcqs'),
    },
    {
      id: 'materials' as NavTab,
      label: 'Material',
      icon: BookOpen,
      isActive: currentTab === 'materials',
      action: () => onSelectTab('materials'),
      isHighlight: true,
    },
    {
      id: 'assistant' as NavTab,
      label: 'AI Tutor',
      icon: Bot,
      isActive: currentTab === 'assistant',
      action: () => onSelectTab('assistant'),
    },
    {
      id: 'menu' as any,
      label: 'More',
      icon: Menu,
      isActive: isMenuTabActive,
      action: onOpenMenu,
      badge: mistakesCount > 0 ? `${mistakesCount}` : undefined,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#091117]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] lg:hidden"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
        paddingTop: '0.4rem',
      }}
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          const isHighlight = (tab as any).isHighlight;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={tab.action}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation relative ${
                active
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {/* Icon Container */}
              {isHighlight ? (
                <div
                  className={`relative p-2 rounded-xl transition-all duration-200 shadow-xs ${
                    active
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white ring-2 ring-emerald-400/40 shadow-md scale-105'
                      : 'bg-slate-900 dark:bg-[#13222F] text-white hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 text-white" strokeWidth={active ? 2.4 : 2} />
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </div>
              ) : (
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300/60 dark:ring-emerald-700/60'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.3 : 1.8} />

                  {/* Notification / Mistake count badge */}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight ${
                  active
                    ? 'font-bold text-emerald-800 dark:text-emerald-300'
                    : 'font-medium text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active dot */}
              {active && !isHighlight && (
                <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
