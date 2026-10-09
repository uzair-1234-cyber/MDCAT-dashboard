import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  Bot,
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import { MedicalLogo } from './MedicalLogo';
import booksPlantMintImg from '../assets/images/books_plant_mint_1791015405961.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, message: string) => void;
  initialMode?: 'login' | 'register';
  canClose?: boolean;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  canClose = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forms
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.login(loginForm);
      onAuthSuccess(res.user, res.message || 'Login successful!');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-900/65 dark:bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]"
      onClick={canClose ? onClose : undefined}
    >
      <div
        className="w-full max-w-4xl my-auto bg-white dark:bg-[#0B1720] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:grid md:grid-cols-12 relative animate-scaleUp max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs backdrop-blur-xs transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

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
            {mode === 'register' ? (
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

            {/* Feature Bullet List with Icons: Visible on sm+ */}
            <div className="hidden sm:flex flex-col space-y-2.5 sm:space-y-3 pt-1">
              {mode === 'register' ? (
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

          {/* Bottom Visual: Books and succulent plant (hidden on mobile, visible on desktop md+) */}
          <div className="hidden md:block pt-6 mt-4 relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-white/60 dark:bg-black/20 border border-white/60 shadow-xs">
              <img
                src={booksPlantMintImg || '/images/books_plant_mint.jpg'}
                alt="Sindh Medical Textbooks and Succulent Plant"
                className="w-full h-full object-cover object-center"
              />
            </div>
            {mode === 'login' && (
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
          {mode === 'register' ? (
            <div>
              <div className="mb-4 sm:mb-5 text-left">
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
                        setMode('login');
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
                        setMode('register');
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
  );
};
