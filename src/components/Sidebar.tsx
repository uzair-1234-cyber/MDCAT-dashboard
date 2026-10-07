import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Sparkles,
  Database,
  AlertTriangle,
  TrendingUp,
  Settings,
  Brain,
  Sprout,
  X,
  BookOpenCheck,
  FileText,
  Bookmark,
  CalendarCheck2,
} from 'lucide-react';
import { UserProfile, AuthUser } from '../types';
import { User, LogIn } from 'lucide-react';
import { MedicalLogo } from './MedicalLogo';

export type NavTab =
  | 'dashboard'
  | 'pastpapers'
  | 'mistakes'
  | 'materials'
  | 'assistant'
  | 'mcqs'
  | 'quizzes'
  | 'progress'
  | 'revision'
  | 'notes'
  | 'bookmarks'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeSubject?: string;
  onClearSubject?: () => void;
  mistakesCount?: number;
  userProfile?: UserProfile;
  currentUser?: AuthUser | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenAccount?: () => void;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  activeSubject,
  onClearSubject,
  mistakesCount = 0,
  userProfile,
  currentUser,
  onOpenAuth,
  onOpenAccount,
}) => {
  // Main Navigation items matching the reference design exactly
  const primaryNavItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materials', label: 'Study Material', icon: BookOpen },
    { id: 'mcqs', label: 'MCQs', icon: CheckSquare },
    { id: 'assistant', label: 'AI Tutor', icon: Sparkles },
    { id: 'progress', label: 'Syllabus', icon: BookOpen },
    { id: 'quizzes', label: 'Question Bank', icon: Database },
    {
      id: 'mistakes',
      label: 'Mistake Book',
      icon: AlertTriangle,
      badge: mistakesCount > 0 ? `${mistakesCount}` : undefined,
    },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Secondary Tools to preserve all existing functionality
  const secondaryNavItems: NavItemConfig[] = [
    { id: 'pastpapers', label: 'Past Papers AI', icon: BookOpenCheck, badge: 'NEW' },
    { id: 'revision', label: 'Revision Plan', icon: CalendarCheck2 },
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  const handleNavClick = (tab: NavTab) => {
    if (activeSubject && onClearSubject) onClearSubject();
    onSelectTab(tab);
    onCloseMobile();
  };

  React.useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Dark Forest Green Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A201B] text-white flex flex-col border-r border-[#13352D] shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Simple Official Medical Logo */}
        <div className="px-4 pt-5 pb-3.5 flex items-center justify-between border-b border-[#13352D]/60">
          <div className="flex items-center gap-2 min-w-0">
            <MedicalLogo size="md" />
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-emerald-300/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          {primaryNavItems.map((item, idx) => {
            const Icon = item.icon;
            // Handle syllabus vs progress distinction when clicking
            const isActive = currentTab === item.id && (item.label !== 'Syllabus' || !activeSubject);

            return (
              <button
                key={`${item.id}-${item.label}-${idx}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#153B32] text-white font-semibold shadow-xs'
                    : 'text-emerald-100/75 hover:text-white hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-emerald-300/70 group-hover:text-emerald-200'
                    }`}
                  />
                  <span className="truncate tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Divider for Extra Tools */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/50">
              Workspace & Tools
            </span>
          </div>

          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#153B32] text-white font-semibold shadow-xs'
                    : 'text-emerald-100/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-emerald-400/60 group-hover:text-emerald-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Account / Profile Area */}
        <div className="px-3.5 pt-2">
          {currentUser ? (
            <button
              onClick={() => {
                onOpenAccount?.();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-emerald-100 truncate group-hover:text-white">
                  Dr. {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-300/70 truncate">
                  {currentUser.targetExam || 'MDCAT 2026'}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAuth?.();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Create Account / Login</span>
            </button>
          )}
        </div>

        {/* Bottom Motivation Card: Sprout Icon + Wave Background */}
        <div className="p-3.5 mt-auto space-y-2">
          <div className="relative overflow-hidden rounded-2xl bg-[#061814] border border-emerald-900/40 p-4 text-emerald-100 shadow-inner group">
            {/* Soft decorative background glow */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Sprout className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed tracking-tight">
                Small steps every day lead to big results.
              </p>
            </div>
          </div>
          <div className="text-center pt-1 text-[11px] text-emerald-400/70 font-medium">
            Created by <span className="font-bold text-emerald-300">Muhammad Uzair</span>
          </div>
        </div>
      </aside>
    </>
  );
};
