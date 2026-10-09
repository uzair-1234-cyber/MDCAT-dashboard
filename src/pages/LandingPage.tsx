import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  CheckSquare,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Search,
  Check,
  Bot,
  Shield,
  Lightbulb,
  Youtube,
  Facebook,
  Twitter,
  Instagram,
  FileText,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { api } from '../services/api';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import { MedicalLogo } from '../components/MedicalLogo';
import dashboardHeroDeskImg from '../assets/images/dashboard_hero_desk_1790761688566.jpg';
import studentStudyLaptopImg from '../assets/images/student_study_laptop_1791015387328.jpg';
import booksPlantMintImg from '../assets/images/books_plant_mint_1791015405961.jpg';

interface LandingPageProps {
  onAuthSuccess: (user: AuthUser, message: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Brand Icon: Stylized Brain Hemispheres from mockup
const SindhBrainIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
  </svg>
);

// Discord Icon
const DiscordIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onAuthSuccess,
  theme = 'light',
  onToggleTheme,
}) => {
  // Modal state: null | 'login' | 'register'
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModal(mode);
    setErrorMsg(null);
  };

  const closeAuth = () => {
    setAuthModal(null);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.login(loginForm);
      onAuthSuccess(res.user, res.message || 'Login successful!');
      closeAuth();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter carefully.');
      return;
    }
    if (registerForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        aspirantType: 'First-Year Sindh Board (XI Pre-Medical)',
        targetExam: 'MDCAT / NUMS',
        targetYear: '2026',
        dreamMedicalCollege: 'Dow University of Health Sciences (DUHS, Karachi)',
        personalMotto: 'Discipline Today → Doctor Tomorrow.',
      });
      onAuthSuccess(res.user, res.message || 'Account created successfully!');
      closeAuth();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#071015] text-[#1E293B] dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col selection:bg-[#0B5E43]/20 selection:text-[#0B5E43]">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP NAVBAR (Matching Reference Mockup Header) */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#09151D]/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          {/* Logo: Official Medical Logo */}
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <MedicalLogo size="md" />
          </div>

          {/* Navigation Items (Center, desktop only) */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <a
              href="#home"
              className="px-3.5 py-1.5 rounded-full bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-300 font-bold transition-all"
            >
              Home
            </a>
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#0B5E43] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
            >
              Features
            </a>
            <a
              href="#subjects"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#0B5E43] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
            >
              Subjects
            </a>
            <a
              href="#about"
              className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#0B5E43] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
            >
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Desktop / Tablet Prominent Theme Switcher (Day ☀️ / Night 🌙) */}
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
              title={
                theme === 'dark'
                  ? 'Currently Night Study Mode — Click to switch to Day Light Mode'
                  : 'Currently Day Light Mode — Click to switch to Night Study Mode'
              }
              aria-label="Toggle Day and Night theme"
              className="hidden sm:inline-flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-[#12221C] rounded-full border border-slate-200 dark:border-emerald-800/80 shadow-2xs cursor-pointer hover:border-emerald-500 transition-all select-none active:scale-95 shrink-0"
            >
              {/* Sun Button (Day Mode) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (theme === 'dark') onToggleTheme?.();
                }}
                title="Switch to Day Light Mode"
                aria-label="Day Light Mode"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300 font-extrabold'
                    : 'text-slate-500 dark:text-emerald-300/70 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Day</span>
              </button>

              {/* Moon Button (Night Mode) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (theme === 'light') onToggleTheme?.();
                }}
                title="Switch to Night Study Mode"
                aria-label="Night Study Mode"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs ring-1 ring-emerald-300 font-extrabold'
                    : 'text-slate-500 dark:text-emerald-300/70 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </button>
            </div>

            {/* Mobile Prominent 1-Tap Theme Toggle (< 640px) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#12221C] border border-slate-200 dark:border-emerald-800 text-slate-800 dark:text-emerald-300 text-xs font-bold active:scale-95 transition-all shadow-2xs shrink-0"
              title={theme === 'dark' ? 'Switch to Day Light Mode' : 'Switch to Night Study Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Night</span>
                </>
              )}
            </button>

            <button
              onClick={() => openAuth('login')}
              className="hidden sm:flex p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuth('login')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0B5E43] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-200/80 dark:border-slate-700 whitespace-nowrap shrink-0"
            >
              Login
            </button>

            <button
              onClick={() => openAuth('register')}
              className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0B5E43] hover:bg-[#084D37] text-white shadow-xs hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              Sign Up
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white/98 dark:bg-[#09151D]/98 px-4 py-3 space-y-1.5 animate-fadeIn shadow-lg">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-300"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Features
            </a>
            <a
              href="#subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Subjects
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              About
            </a>

            {/* Mobile Theme Selector Card */}
            <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
                Display Theme / Study Mode
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (theme === 'dark') onToggleTheme?.();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    theme === 'light'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs ring-1 ring-amber-300'
                      : 'bg-slate-100 dark:bg-[#12221C] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-emerald-900/60'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Day Mode</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (theme === 'light') onToggleTheme?.();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    theme === 'dark'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
                      : 'bg-slate-100 dark:bg-[#12221C] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-emerald-900/60'
                  }`}
                >
                  <Moon className="w-4 h-4 text-emerald-400" />
                  <span>Night Mode</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. HERO SECTION (Matching Left Side of Showcase) */}
      {/* ---------------------------------------------------- */}
      <section id="home" className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading, Subtitle, CTA buttons, 4 icons */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Hero Badges Row: Exam Target & Interactive Theme Mode Switcher */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4EA] dark:bg-emerald-950/70 border border-[#CEE9D9] dark:border-emerald-800/60 text-[#0B5E43] dark:text-emerald-300 text-xs font-bold shadow-2xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>MDCAT / NUMS • 2026</span>
                </div>

                {/* Prominent Quick Theme Changer in Hero */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0E1F1A] border border-slate-200/90 dark:border-emerald-800/80 hover:border-emerald-500 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer select-none active:scale-95 group"
                  title={
                    theme === 'dark'
                      ? 'Currently in Night Study Mode — Click to switch to Day Light Mode'
                      : 'Currently in Day Light Mode — Click to switch to Night Study Mode'
                  }
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                      <span>Theme: <strong className="text-emerald-300">Night Study</strong></span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Switch to Day ☀️
                      </span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-emerald-600 group-hover:-rotate-12 transition-transform" />
                      <span>Theme: <strong className="text-[#0B5E43]">Day Mode</strong></span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Switch to Night 🌙
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-[1.12]">
                Your Medical
                <br />
                <span className="text-[#0B5E43] dark:text-emerald-400">College Journey</span>
                <br />
                Starts Here
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
                Get complete study material, MCQs, past papers and smart tools — all in one place. Study smarter, not harder.
              </p>

              {/* Hero Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openAuth('register')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B5E43] hover:bg-[#084D37] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openAuth('login')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C161F] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm text-center transition-all"
                >
                  Explore Features
                </button>
              </div>

              {/* 4 Feature Items Under Hero Buttons */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    Quality<br />Study Material
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    MCQs with<br />Detailed Explanations
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    Progress<br />Tracking
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    24/7<br />Access
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic with Tablet, Books, Stethoscope, Plant & Cursive Script */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-tr from-[#E6F4EA] via-[#EDF8F2] to-[#E2F2E8] dark:from-[#0B1E17] dark:via-[#091D16] dark:to-[#081813] border border-[#D2EBDE] dark:border-emerald-900/50 p-6 sm:p-8 shadow-md">
                {/* Handwritten script annotation in the mockup: "Better Preperation, Brighter Future" */}
                <div className="absolute top-4 right-6 z-20 select-none">
                  <div className="rotate-[-6deg] flex flex-col items-center">
                    <span className="font-serif italic text-sm sm:text-base font-bold text-[#0B5E43] dark:text-emerald-300 tracking-wide drop-shadow-xs">
                      Better Preperation
                    </span>
                    <span className="font-serif italic text-xs sm:text-sm font-semibold text-[#0B5E43]/90 dark:text-emerald-400">
                      Brighter Future ✨
                    </span>
                  </div>
                </div>

                {/* Stethoscope & Tablet Study Photo */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/80 dark:border-slate-800 aspect-[4/3] bg-white">
                  <img
                    src={dashboardHeroDeskImg || '/images/dashboard_hero_desk.jpg'}
                    alt="Sindh Medical College Dashboard and Study Desk"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white text-xs font-medium">
                      <span className="font-bold text-emerald-300">MDCAT PREP</span> · Digital Practice Command Center
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. "EVERYTHING YOU NEED IN ONE PLACE" SECTION */}
      {/* ---------------------------------------------------- */}
      <section id="features" className="py-14 sm:py-16 bg-white dark:bg-[#08131B] border-y border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-left mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Everything You Need in One Place
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive resources to help you ace your medical entrance exams.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Study Material */}
            <div className="p-6 rounded-2xl bg-[#F8FAF9] dark:bg-[#0D1C27] border border-[#E2EBE5] dark:border-slate-800 hover:border-[#0B5E43]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                Study Material
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chapter-wise notes, key points and concise summaries.
              </p>
            </div>

            {/* Card 2: MCQs */}
            <div className="p-6 rounded-2xl bg-[#F8FAF9] dark:bg-[#0D1C27] border border-[#E2EBE5] dark:border-slate-800 hover:border-[#0B5E43]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                MCQs
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice with past papers and topic-wise MCQs.
              </p>
            </div>

            {/* Card 3: AI Tutor */}
            <div className="p-6 rounded-2xl bg-[#F8FAF9] dark:bg-[#0D1C27] border border-[#E2EBE5] dark:border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] dark:bg-purple-950/60 text-[#9333EA] dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                AI Tutor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get instant help with your doubts.
              </p>
            </div>

            {/* Card 4: Progress Tracking */}
            <div className="p-6 rounded-2xl bg-[#F8FAF9] dark:bg-[#0D1C27] border border-[#E2EBE5] dark:border-slate-800 hover:border-[#0B5E43]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#0B5E43] dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">
                Progress Tracking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Monitor your performance and stay on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. "BUILT FOR STUDENTS, DESIGNED FOR SUCCESS" */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="py-14 sm:py-18 bg-[#F8FAF9] dark:bg-[#071015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-emerald-950/70 border border-[#CEE9D9] dark:border-emerald-800/60 text-[#0B5E43] dark:text-emerald-300 text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Why Choose MDCAT PREP?</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                Built for Students, Designed for Success
              </h2>

              {/* Checklist */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0B5E43] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Updated syllabus (MDCAT / NUMS)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0B5E43] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Easy to follow study plans
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0B5E43] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Mobile friendly experience
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0B5E43] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Access anytime, anywhere
                  </span>
                </div>
              </div>

              {/* Button */}
              <div className="pt-2">
                <button
                  onClick={() => openAuth('register')}
                  className="px-6 py-3 rounded-xl bg-[#0B5E43] hover:bg-[#084D37] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <span>Start Studying Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Graphic: Student Studying with Cursive Note "Small steps, Big dreams" */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 aspect-[16/10] bg-white">
                <img
                  src={studentStudyLaptopImg || '/images/student_study_laptop.jpg'}
                  alt="Student Studying with Laptop"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-500"
                />
                {/* Handwritten Annotation: "Small steps, Big dreams" */}
                <div className="absolute top-4 left-6 z-20 select-none">
                  <div className="rotate-[-6deg] flex flex-col items-start bg-white/80 dark:bg-black/60 px-3 py-1 rounded-xl backdrop-blur-xs">
                    <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0B5E43] dark:text-emerald-300">
                      Small steps
                    </span>
                    <span className="font-serif italic text-xs sm:text-sm font-semibold text-[#0B5E43]/90 dark:text-emerald-400">
                      Big dreams ✨
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. FOOTER (Matching Reference Mockup) */}
      {/* ---------------------------------------------------- */}
      <footer className="mt-auto bg-white dark:bg-[#071017] border-t border-slate-200/80 dark:border-slate-800 pt-10 pb-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Brand & Motto */}
            <div className="space-y-1">
              <MedicalLogo size="sm" />
              <p className="text-[11px] text-slate-400">
                Study Today, Succeed Tomorrow.
              </p>
            </div>

            {/* Center Links */}
            <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-600 dark:text-slate-300">
              <a href="#home" className="hover:text-[#0B5E43] dark:hover:text-emerald-400 transition-colors">Home</a>
              <a href="#features" className="hover:text-[#0B5E43] dark:hover:text-emerald-400 transition-colors">Features</a>
              <a href="#subjects" className="hover:text-[#0B5E43] dark:hover:text-emerald-400 transition-colors">Subjects</a>
              <a href="#about" className="hover:text-[#0B5E43] dark:hover:text-emerald-400 transition-colors">About</a>
              <button onClick={() => openAuth('register')} className="hover:text-[#0B5E43] dark:hover:text-emerald-400 transition-colors">Contact</button>
            </div>

            {/* Right Social Icons */}
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white transition-colors" aria-label="X Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500 transition-colors" aria-label="Discord">
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a href="#" className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-pink-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bottom Hairline & Legal */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 text-center sm:text-left">
              <p>© 2026 MDCAT PREP. All rights reserved.</p>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                Created by <span className="font-bold text-[#0B5E43] dark:text-emerald-400">Muhammad Uzair</span>
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                title="Toggle Day / Night theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{theme === 'dark' ? '☀️ Day Mode' : '🌙 Night Mode'}</span>
              </button>
              <button onClick={() => openAuth('login')} className="hover:underline">Privacy Policy</button>
              <span>·</span>
              <button onClick={() => openAuth('register')} className="hover:underline">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick Theme Toggle (Bottom-Right, Always Accessible) */}
      <button
        type="button"
        onClick={onToggleTheme}
        className="fixed bottom-5 right-5 z-50 px-3.5 py-2.5 rounded-full bg-white dark:bg-[#0E1E19] text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-300 dark:border-emerald-700/80 hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all group flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-xs select-none"
        title={
          theme === 'dark'
            ? 'Currently Night Study Mode — Click to switch to Day Light Mode'
            : 'Currently Day Light Mode — Click to switch to Night Study Mode'
        }
        aria-label="Toggle Day and Night theme"
      >
        {theme === 'dark' ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-extrabold text-slate-100">Day Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-emerald-600 group-hover:-rotate-12 transition-transform" />
            <span className="text-xs font-extrabold text-slate-800">Night Study</span>
          </>
        )}
      </button>

      {/* ---------------------------------------------------- */}
      {/* 6. PIXEL-PERFECT SPLIT AUTH MODAL (Sign Up & Login) */}
      {/* ---------------------------------------------------- */}
      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-900/65 dark:bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={closeAuth}
        >
          <div
            className="w-full max-w-4xl my-auto bg-white dark:bg-[#0B1720] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:grid md:grid-cols-12 relative animate-scaleUp max-h-[92vh] sm:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeAuth}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs backdrop-blur-xs transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* ----------------------------------------------- */}
            {/* LEFT COLUMN: Soft Mint Brand Column */}
            {/* ----------------------------------------------- */}
            <div className="md:col-span-5 bg-[#EDF7F2] dark:bg-[#071C17] p-4 sm:p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D2EBDD] dark:border-emerald-950 shrink-0">
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* Brand Logo: Official Medical Logo */}
                <div className="flex items-center gap-2">
                  <MedicalLogo size="sm" textTone="auto" />
                </div>

                {/* Heading & Subtitle */}
                {authModal === 'register' ? (
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#0F172A] dark:text-white leading-tight">
                      Create Your<br className="hidden sm:inline" /> Account
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 sm:mt-2 leading-relaxed">
                      Join thousands of students preparing for MDCAT / NUMS 2026.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#0F172A] dark:text-white leading-tight">
                      Welcome Back
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 sm:mt-2 leading-relaxed">
                      Sign in to continue your learning journey and reach your goals.
                    </p>
                  </div>
                )}

                {/* Feature Bullet List with Icons: Visible on screens >= sm */}
                <div className="hidden sm:flex flex-col space-y-2.5 sm:space-y-3 pt-1">
                  {authModal === 'register' ? (
                    <>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span>Access study material</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <CheckSquare className="w-3.5 h-3.5" />
                        </div>
                        <span>Practice MCQs</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <span>Track your progress</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span>Get AI-powered help</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span>Access your study material</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <span>Continue your progress</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="w-6 h-6 rounded-md bg-[#DCF2E7] dark:bg-emerald-900/60 text-[#0B5E43] dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <span>Get personalized support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Visual: Books and succulent plant (hidden on mobile, visible on desktop) */}
              <div className="hidden md:block pt-6 mt-4 relative">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/60 dark:bg-black/20 border border-white/60 shadow-xs">
                  <img
                    src={booksPlantMintImg || '/images/books_plant_mint.jpg'}
                    alt="Sindh Medical Textbooks and Succulent Plant"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {authModal === 'login' && (
                  <div className="absolute -top-1 right-2 rotate-[-5deg] select-none">
                    <span className="font-serif italic text-xs font-bold text-[#0B5E43] dark:text-emerald-300 bg-white/90 px-2 py-0.5 rounded-md shadow-2xs">
                      Keep Going ✨
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ----------------------------------------------- */}
            {/* RIGHT COLUMN: Clean White Form Column */}
            {/* ----------------------------------------------- */}
            <div className="md:col-span-7 p-4 sm:p-7 md:p-8 md:px-10 flex flex-col justify-center overflow-y-auto">
              {/* Error banner */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ------------------ SIGN UP FORM ------------------ */}
              {authModal === 'register' ? (
                <div>
                  <div className="mb-5 text-left">
                    <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white">
                      Sign Up
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Fill in your details to get started
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          placeholder="Create a strong password"
                          className="w-full pl-9 pr-11 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          placeholder="Confirm your password"
                          className="w-full pl-9 pr-11 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Create Account Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 sm:py-2.5 px-4 min-h-[46px] rounded-xl bg-[#0B5E43] hover:bg-[#084D37] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Create Account</span>
                        )}
                      </button>
                    </div>

                    {/* Switch to Login */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModal('login');
                            setErrorMsg(null);
                          }}
                          className="font-bold text-[#0B5E43] dark:text-emerald-400 hover:underline"
                        >
                          Login
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              ) : (
                /* ------------------ LOGIN FORM ------------------ */
                <div>
                  <div className="mb-4 sm:mb-5 text-left">
                    <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white">
                      Login
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Enter your email and password to access your account
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-11 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[42px] sm:min-h-[38px] bg-slate-50 dark:bg-[#11202B] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B5E43] text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs py-0.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0B5E43] focus:ring-[#0B5E43]"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setErrorMsg('For password reset, please contact support or re-register with your email.')}
                        className="text-slate-500 hover:text-[#0B5E43] dark:hover:text-emerald-400 py-1"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Login Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 sm:py-2.5 px-4 min-h-[46px] rounded-xl bg-[#0B5E43] hover:bg-[#084D37] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Login</span>
                        )}
                      </button>
                    </div>

                    {/* Switch to Sign Up */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModal('register');
                            setErrorMsg(null);
                          }}
                          className="font-bold text-[#0B5E43] dark:text-emerald-400 hover:underline"
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
