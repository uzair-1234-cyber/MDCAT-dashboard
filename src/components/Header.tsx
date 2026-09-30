import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Menu,
  Timer,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  BookOpen,
  AlertTriangle,
  Calendar,
  Sparkles,
  User,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenTimer: () => void;
  onSelectTab: (tab: NavTab) => void;
  timerActive: boolean;
  studyMinutesToday: number;
  onResetToZero?: () => void;
  userProfile?: UserProfile;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onSelectTheme?: (t: 'light' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenTimer,
  onSelectTab,
  timerActive,
  studyMinutesToday,
  userProfile,
  theme = 'light',
  onToggleTheme,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
      // Ctrl+K or Cmd+K quick search trigger
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenSearch]);

  const studentName = userProfile?.name || 'Muhammad Uzair';
  const targetCollege = userProfile?.dreamMedicalCollege || 'Dow / SMC / AKU';

  const notifications = [
    {
      id: 1,
      title: 'Sindh Board XI Curriculum Live',
      description: 'New updated MCQs & Chapter Summaries for Biology, Physics & Chemistry added.',
      time: 'Just now',
      unread: true,
      action: () => {
        onSelectTab('materials');
        setNotificationsOpen(false);
      },
    },
    {
      id: 2,
      title: 'Daily MDCAT Target',
      description: 'Complete 25 MCQs today to maintain your study streak.',
      time: 'Today',
      unread: true,
      action: () => {
        onSelectTab('mcqs');
        setNotificationsOpen(false);
      },
    },
    {
      id: 3,
      title: 'Mistake Book Review',
      description: 'Revise saved mistakes before your weekly mock drill.',
      time: '1h ago',
      unread: false,
      action: () => {
        onSelectTab('mistakes');
        setNotificationsOpen(false);
      },
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F4F6F8]/95 dark:bg-[#091117]/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 h-16 sm:h-18 max-w-7xl mx-auto">
        {/* Left Section: Mobile Menu Trigger + Search Pill */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-xl">
          {/* Hamburger Menu (visible on mobile / tablet < lg) */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 sm:p-2.5 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white rounded-xl bg-slate-200/50 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            aria-label="Open navigation menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Pill: Responsive with truncated text & keyboard badge */}
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#EAEFF4] dark:bg-[#121E28] hover:bg-[#E3E9F0] dark:hover:bg-[#182736] text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white text-xs sm:text-sm font-medium transition-all shadow-2xs group text-left border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-w-0"
            title="Search study materials, MCQs, and chapters (Ctrl+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
              <span className="truncate hidden sm:inline">Search books, topics, MCQs...</span>
              <span className="truncate inline sm:hidden">Search...</span>
            </div>
            {/* Keyboard shortcut hint on tablet/desktop */}
            <span className="hidden md:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700 shrink-0">
              ⌘K
            </span>
          </button>
        </div>

        {/* Right Section: Focus Mode, Theme Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Focus Mode Pill (Compact on mobile, expanded on desktop) */}
          <button
            onClick={onOpenTimer}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full border text-xs font-semibold transition-all shadow-2xs hover:shadow-sm active:scale-95 shrink-0 ${
              timerActive
                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-400/30 animate-pulse'
                : 'bg-white dark:bg-[#121E28] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-700'
            }`}
            title="Focus Study Timer (25 min session)"
            aria-label="Focus Study Timer"
          >
            <Timer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${timerActive ? 'text-emerald-600 animate-spin' : 'text-slate-600 dark:text-slate-400'}`} />
            <span className="hidden md:inline font-bold">Focus Mode</span>
            <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold text-[11px] sm:text-xs">
              {timerActive ? `${studyMinutesToday}m` : '25m'}
            </span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 hidden sm:inline shrink-0" />
          </button>

          {/* Theme Pill on sm+ screens (Dual Sun/Moon pill matching screenshot) */}
          <div
            onClick={onToggleTheme}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleTheme?.();
              }
            }}
            title={theme === 'dark' ? 'Click to Switch to Light Theme (Day Mode)' : 'Click to Switch to Dark Theme (Night Study)'}
            aria-label="Toggle Dark and Light theme"
            className="hidden sm:flex items-center gap-1 p-0.5 sm:p-1 bg-[#0A201B] rounded-full border border-emerald-900/80 px-2 py-1 shadow-2xs cursor-pointer hover:border-emerald-500/80 transition-all select-none active:scale-95 shrink-0"
          >
            {/* Sun Icon (Light Mode) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (theme === 'dark') onToggleTheme?.();
              }}
              title="Light Mode (Day)"
              aria-label="Select Light Mode"
              className={`p-1 rounded-full transition-all duration-200 cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-300 scale-105 font-bold'
                  : 'text-emerald-400/50 hover:text-emerald-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            {/* Moon Icon (Dark Mode) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (theme === 'light') onToggleTheme?.();
              }}
              title="Dark Mode (Night Study)"
              aria-label="Select Dark Mode"
              className={`p-1 rounded-full transition-all duration-200 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm ring-1 ring-emerald-300 scale-105 font-bold'
                  : 'text-emerald-400/50 hover:text-emerald-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Theme Toggle Button (< 640px) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="sm:hidden p-2 rounded-full bg-white dark:bg-[#121E28] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs active:scale-95 transition-all shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark and Light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-700" />
            )}
          </button>

          {/* Notification Bell with Dropdown Menu */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 sm:p-2.5 rounded-full bg-white dark:bg-[#121E28] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all active:scale-95 shrink-0 focus:outline-none"
              title="Notifications & Study Updates"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* Notifications Popover Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#0E1A24] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-slate-50 dark:bg-[#12222F] border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Study Updates
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    2 New
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-[#152735] transition-colors flex items-start gap-2.5 group"
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.unread ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-[#12222F] border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setNotificationsOpen(false);
                    }}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Notification Settings
                  </button>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full bg-white dark:bg-[#121E28] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xs transition-all group shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title="User Profile & Quick Menu"
              aria-label="User Profile"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-emerald-500/30 shadow-2xs relative">
                {userProfile?.name ? (
                  <span>{userProfile.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <img
                    src="/logo.jpg"
                    alt={studentName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[90px] sm:max-w-[120px] hidden md:inline">
                {studentName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#0E1A24] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header with User Info */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-[#0E201B] dark:to-[#12222F] border-b border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-emerald-500/40 shrink-0">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {studentName}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                        Sindh Board XI • MDCAT
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span>Target: <strong className="text-slate-800 dark:text-slate-100">{targetCollege}</strong></span>
                    <span className="font-mono bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      {studyMinutesToday}m studied
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162736] transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>My Profile & Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('mistakes');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162736] transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Mistake Book Drills</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('revision');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162736] transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Revision Planner</span>
                  </button>

                  {/* Dark / Light Toggle Option inside menu */}
                  <button
                    onClick={() => {
                      onToggleTheme?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162736] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{theme === 'dark' ? 'Day Light Mode' : 'Night Dark Mode'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {theme}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
