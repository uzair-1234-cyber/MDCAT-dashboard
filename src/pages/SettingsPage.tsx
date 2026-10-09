import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Target,
  GraduationCap,
  Quote,
  Sun,
  Moon,
  Palette,
  ShieldCheck,
  Lock,
  Clock,
  BookOpen,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Award,
  KeyRound,
  Mail,
  Calendar,
  Compass,
  Sliders,
  Sparkles,
  Save,
  Pencil,
  X,
  Stethoscope,
  Heart,
  Brain,
  Microscope,
  Dna,
  Camera,
  Upload,
  Image as ImageIcon,
  Zap,
  Crown,
} from 'lucide-react';
import { DbStatus, UserProfile } from '../types';
import { api, authStorage } from '../services/api';
import { MedicalLogo, useLogoMood, LOGO_MOODS, LogoMood, EMBLEM_COMPONENTS } from '../components/MedicalLogo';

interface SettingsPageProps {
  status: DbStatus | null;
  userProfile: UserProfile;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onSetTheme?: (t: 'light' | 'dark') => void;
  onResetToZero?: () => Promise<void>;
  onRefreshStatus?: () => Promise<void>;
  onUpdateUserProfile?: (updated: Partial<UserProfile>) => Promise<void>;
}

const POPULAR_COLLEGES = [
  'Dow University of Health Sciences (DUHS, Karachi)',
  'King Edward Medical University (KEMU, Lahore)',
  'Liaquat University of Medical & Health Sciences (LUMHS, Jamshoro)',
  'Jinnah Sindh Medical University / SMC (Karachi)',
  'Aga Khan University Medical College (AKU, Karachi)',
  'Chandka Medical College (CMC, Larkana)',
  'Peoples University of Medical & Health Sciences (PUMHSW, SBA)',
  'Nishtar Medical University (NMU, Multan)',
  'Rawalpindi Medical University (RMU)',
  'Khyber Medical College (KMC, Peshawar)',
  'Allama Iqbal Medical College (AIMC, Lahore)',
  'Shaheed Mohtarma Benazir Bhutto Medical University (SMBBMU)',
];

const TARGET_PRESETS = [
  { exam: 'Sindh MDCAT (DUHS Karachi)', year: '2026', label: 'Sindh MDCAT (2026)' },
  { exam: 'MDCAT / NUMS National', year: '2026', label: 'MDCAT / NUMS (2026)' },
  { exam: 'NUMS Armed Forces Cadet', year: '2026', label: 'NUMS Cadet (2026)' },
  { exam: 'UHS Punjab MDCAT', year: '2026', label: 'Punjab MDCAT (2026)' },
  { exam: 'MDCAT Repeater / Improver', year: '2026', label: 'MDCAT Repeater (2026)' },
];

const ASPIRANT_TYPES = [
  'First-Year Sindh Board (XI Pre-Medical)',
  'Second-Year Sindh Board (XII Pre-Medical)',
  'MDCAT Full Repeater / Improver',
  'NUMS Cadet College Aspirant',
  'Federal Board (FBISE) Candidate',
];

const BADGES = [
  { id: 'stethoscope', label: 'Future Doctor', icon: Stethoscope, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
  { id: 'brain', label: 'Neuro Aspirant', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800' },
  { id: 'heart', label: 'Cardio Focus', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' },
  { id: 'dna', label: 'Biochemistry Pro', icon: Dna, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800' },
  { id: 'microscope', label: 'Clinical Pathology', icon: Microscope, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  theme = 'light',
  onToggleTheme,
  onSetTheme,
  onResetToZero,
  onRefreshStatus,
  onUpdateUserProfile,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'logo' | 'appearance' | 'security'>('profile');
  const { mood: activeLogoMood, setMood: setActiveLogoMood, moodInfo: currentMoodInfo } = useLogoMood();

  // Stored auth user details
  const [authUser, setAuthUser] = useState(authStorage.getUser());

  // Profile Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: userProfile?.name || authUser?.name || 'Future Doctor',
    aspirantType: userProfile?.aspirantType || authUser?.aspirantType || 'First-Year Sindh Board (XI Pre-Medical)',
    targetExam: userProfile?.targetExam || authUser?.targetExam || 'Sindh MDCAT (DUHS Karachi)',
    targetYear: userProfile?.targetYear || authUser?.targetYear || '2026',
    dreamMedicalCollege: userProfile?.dreamMedicalCollege || authUser?.dreamMedicalCollege || 'Dow University of Health Sciences (DUHS, Karachi)',
    personalMotto: userProfile?.personalMotto || authUser?.personalMotto || 'Future Doctor in the making — Dedication, Focus, Success.',
    avatarUrl: userProfile?.avatarUrl || authUser?.avatarUrl || '',
  });

  // Selected avatar badge
  const [selectedBadge, setSelectedBadge] = useState<string>(() => {
    return localStorage.getItem('mediprep_student_badge') || 'stethoscope';
  });

  // Study & Quiz Preferences
  const [studyPrefs, setStudyPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('mediprep_study_prefs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      dailyGoalHours: 4,
      defaultDifficulty: 'MDCAT Level',
      quizBatchSize: 20,
      timerDuration: 25,
      showInstantExplanations: true,
      soundFeedback: true,
    };
  });
  const [prefsSavedMsg, setPrefsSavedMsg] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  // Reset to Zero State
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const user = authStorage.getUser();
    setAuthUser(user);
    if (userProfile || user) {
      setFormData({
        name: userProfile?.name || user?.name || '',
        aspirantType: userProfile?.aspirantType || user?.aspirantType || 'First-Year Sindh Board (XI Pre-Medical)',
        targetExam: userProfile?.targetExam || user?.targetExam || 'Sindh MDCAT (DUHS Karachi)',
        targetYear: userProfile?.targetYear || user?.targetYear || '2026',
        dreamMedicalCollege: userProfile?.dreamMedicalCollege || user?.dreamMedicalCollege || 'Dow University of Health Sciences (DUHS, Karachi)',
        personalMotto: userProfile?.personalMotto || user?.personalMotto || 'Future Doctor in the making — Dedication, Focus, Success.',
        avatarUrl: userProfile?.avatarUrl || user?.avatarUrl || '',
      });
    }
  }, [userProfile]);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
        try {
          setIsSavingProfile(true);
          const payload = {
            name: formData.name.trim(),
            aspirantType: formData.aspirantType.trim(),
            targetExam: formData.targetExam.trim(),
            targetYear: formData.targetYear.trim(),
            dreamMedicalCollege: formData.dreamMedicalCollege.trim(),
            personalMotto: formData.personalMotto.trim(),
            avatarUrl: base64,
          };
          if (onUpdateUserProfile) {
            await onUpdateUserProfile(payload);
          } else {
            await api.updateUserProfile(payload);
          }
          try {
            await api.updateAuthProfile(payload);
            setAuthUser(authStorage.getUser());
          } catch (_) {}
          setProfileSuccessMsg('Profile picture updated successfully from gallery!');
          setTimeout(() => setProfileSuccessMsg(null), 2500);
        } catch (err: any) {
          setProfileErrorMsg(err?.message || 'Failed to update profile picture.');
        } finally {
          setIsSavingProfile(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    try {
      setIsSavingProfile(true);
      const payload = {
        name: formData.name.trim(),
        aspirantType: formData.aspirantType.trim(),
        targetExam: formData.targetExam.trim(),
        targetYear: formData.targetYear.trim(),
        dreamMedicalCollege: formData.dreamMedicalCollege.trim(),
        personalMotto: formData.personalMotto.trim(),
        avatarUrl: '',
      };
      if (onUpdateUserProfile) {
        await onUpdateUserProfile(payload);
      } else {
        await api.updateUserProfile(payload);
      }
      try {
        await api.updateAuthProfile(payload);
        setAuthUser(authStorage.getUser());
      } catch (_) {}
      setProfileSuccessMsg('Profile picture removed.');
      setTimeout(() => setProfileSuccessMsg(null), 2000);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Failed to remove picture.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setProfileErrorMsg('Full Name cannot be empty.');
      return;
    }
    if (!formData.dreamMedicalCollege.trim()) {
      setProfileErrorMsg('Please specify your Dream Medical College.');
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileErrorMsg(null);

      const payload = {
        name: formData.name.trim(),
        aspirantType: formData.aspirantType.trim(),
        targetExam: formData.targetExam.trim(),
        targetYear: formData.targetYear.trim(),
        dreamMedicalCollege: formData.dreamMedicalCollege.trim(),
        personalMotto: formData.personalMotto.trim(),
        avatarUrl: formData.avatarUrl,
      };

      if (onUpdateUserProfile) {
        await onUpdateUserProfile(payload);
      } else {
        await api.updateUserProfile(payload);
      }

      // Also update auth profile if logged in
      try {
        await api.updateAuthProfile(payload);
        const updated = authStorage.getUser();
        setAuthUser(updated);
      } catch (_) {}

      if (onRefreshStatus) await onRefreshStatus();

      setProfileSuccessMsg('Profile and Target updated successfully! Changes saved permanently.');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Failed to update student profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userProfile?.name || authUser?.name || '',
      aspirantType: userProfile?.aspirantType || authUser?.aspirantType || 'First-Year Sindh Board (XI Pre-Medical)',
      targetExam: userProfile?.targetExam || authUser?.targetExam || '',
      targetYear: userProfile?.targetYear || authUser?.targetYear || '',
      dreamMedicalCollege: userProfile?.dreamMedicalCollege || authUser?.dreamMedicalCollege || '',
      personalMotto: userProfile?.personalMotto || authUser?.personalMotto || '',
      avatarUrl: userProfile?.avatarUrl || authUser?.avatarUrl || '',
    });
    setProfileErrorMsg(null);
    setIsEditingProfile(false);
  };

  const handleSavePreferences = (newPrefs: typeof studyPrefs) => {
    setStudyPrefs(newPrefs);
    try {
      localStorage.setItem('mediprep_study_prefs', JSON.stringify(newPrefs));
    } catch (_) {}
    setPrefsSavedMsg(true);
    setTimeout(() => setPrefsSavedMsg(false), 2000);
  };

  const handleSelectBadge = (badgeId: string) => {
    setSelectedBadge(badgeId);
    try {
      localStorage.setItem('mediprep_student_badge', badgeId);
    } catch (_) {}
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    if (!currentPassword) {
      setPassErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });
      setPassSuccessMsg(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccessMsg(null), 3000);
    } catch (err: any) {
      setPassErrorMsg(err?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 max-w-5xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Personalize your medical profile, study goals, exam targets, and account security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>MDCAT Aspirant Workspace</span>
          </span>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Study & Quiz Targets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'logo'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>App Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'appearance'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Appearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account Security</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDENT PROFILE */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-500/30 shadow-xs shrink-0 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Medical Aspirant Identity
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This information personalizes your syllabus, dashboard targets, and motivation quotes.
                  </p>
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Profile Feedback Messages */}
            {profileSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}
            {profileErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {/* Gallery Profile Photo Upload Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/80 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-slate-800/40 border border-emerald-100 dark:border-emerald-900/40">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-emerald-500/30 dark:ring-emerald-400/20 shadow-md bg-white dark:bg-slate-800 flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-3xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Camera Overlay Icon */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white dark:ring-slate-900"
                  title="Upload / Change Photo from Gallery"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>Student Profile Photo</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Live everywhere
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select your picture from phone/PC gallery. It updates instantly in the top navigation bar, quick profile menu, and sidebar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Gallery</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!isEditingProfile ? (
              /* View Mode */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formData.name || 'Student Aspirant'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Email</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {authUser?.email || 'Student Account'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Aspirant Category</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formData.aspirantType}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target Exam & Year</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formData.targetExam} ({formData.targetYear})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1 md:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dream Medical College</span>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {formData.dreamMedicalCollege}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1 md:col-span-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Personal Motto</span>
                  <p className="text-sm italic font-medium text-emerald-900 dark:text-emerald-200">
                    "{formData.personalMotto}"
                  </p>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Muhammad Uzair"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Aspirant Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aspirant Category</span>
                    </label>
                    <select
                      value={formData.aspirantType}
                      onChange={(e) => setFormData({ ...formData, aspirantType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {ASPIRANT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Exam */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target Exam</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetExam}
                      onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                      placeholder="e.g. Sindh MDCAT"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {TARGET_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, targetExam: p.exam, targetYear: p.year })}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                            formData.targetExam === p.exam
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target Year</span>
                    </label>
                    <select
                      value={formData.targetYear}
                      onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="2026">2026 (Upcoming Cycle)</option>
                      <option value="2027">2027 (Long-Term Preparation)</option>
                      <option value="2025">2025 (Immediate Repeater)</option>
                    </select>
                  </div>

                  {/* Dream Medical College */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                      <span>Dream Medical College</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.dreamMedicalCollege}
                      onChange={(e) => setFormData({ ...formData, dreamMedicalCollege: e.target.value })}
                      placeholder="e.g. Dow University of Health Sciences (DUHS, Karachi)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />

                    {/* Popular Colleges Pick */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Quick Select Top Colleges:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                        {POPULAR_COLLEGES.map((college) => (
                          <button
                            key={college}
                            type="button"
                            onClick={() => setFormData({ ...formData, dreamMedicalCollege: college })}
                            className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all text-left ${
                              formData.dreamMedicalCollege === college
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border-purple-300 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {college.split('(')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Personal Motto */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Personal Motivational Motto</span>
                    </label>
                    <input
                      type="text"
                      value={formData.personalMotto}
                      onChange={(e) => setFormData({ ...formData, personalMotto: e.target.value })}
                      placeholder="e.g. Discipline Today → Stethoscope Tomorrow."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSavingProfile}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Student Avatar / Badge Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Choose Medical Badge Icon
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select the specialty badge that represents your passion and shows on your student card.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {BADGES.map((b) => {
                const IconComponent = b.icon;
                const isSelected = selectedBadge === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBadge(b.id)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${b.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {b.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STUDY & QUIZ TARGETS */}
      {/* ======================================================== */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Study & Quiz Customization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your daily study targets, mock test questions batch, and focus timer presets.
              </p>
            </div>
            {prefsSavedMsg && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Daily Study Goal */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Daily Study Goal</span>
              </label>
              <div className="flex items-center gap-2">
                {[2, 4, 6, 8].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleSavePreferences({ ...studyPrefs, dailyGoalHours: hours })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      studyPrefs.dailyGoalHours === hours
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {hours} hrs
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Aim for {studyPrefs.dailyGoalHours} hours daily to finish Sindh Board syllabus ahead of time.
              </p>
            </div>

            {/* Default Quiz Difficulty */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Default Practice Difficulty</span>
              </label>
              <select
                value={studyPrefs.defaultDifficulty}
                onChange={(e) => handleSavePreferences({ ...studyPrefs, defaultDifficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="MDCAT Level">MDCAT Level (Standard Exam Rigor)</option>
                <option value="Hard">Hard (Conceptual High-Yield Focus)</option>
                <option value="Medium">Medium (Foundation & Core Concepts)</option>
                <option value="Easy">Easy (Quick Revision Drills)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Sets default MCQ difficulty for new AI practice sessions.
              </p>
            </div>

            {/* Quick Quiz Questions Count */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Quick Quiz Batch Size</span>
              </label>
              <div className="flex items-center gap-2">
                {[10, 20, 30, 50].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleSavePreferences({ ...studyPrefs, quizBatchSize: count })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      studyPrefs.quizBatchSize === count
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {count} MCQs
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Number of MCQs generated per test round.
              </p>
            </div>

            {/* Pomodoro Focus Timer Preset */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Study Timer Focus Preset</span>
              </label>
              <div className="flex items-center gap-2">
                {[25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSavePreferences({ ...studyPrefs, timerDuration: mins })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      studyPrefs.timerDuration === mins
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Default countdown duration for deep concentration sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: APP LOGO */}
      {/* ======================================================== */}
      {activeTab === 'logo' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Official MediPrep Logo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Simple, clean, and distraction-free medical portal identity across Navbar, Sidebar, and Mobile.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Active Everywhere</span>
              </span>
            </div>

            {/* Live Showcase Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0A201B] to-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-400 block">
                  Official Medical Education Identity
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  MDCAT <span className="text-teal-400">— PREP —</span>
                </h4>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Official MDCAT Prep medical education emblem featuring the layered open textbook, clinical stethoscope, and heartbeat pulse cross.
                </p>
                <div className="pt-2">
                  <MedicalLogo size="lg" />
                </div>
              </div>

              {/* Live Preview Display: Full Official Card */}
              <div className="shrink-0 flex items-center justify-center">
                <MedicalLogo variant="card" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: THEME & APPEARANCE */}
      {/* ======================================================== */}
      {activeTab === 'appearance' && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Study Theme & Appearance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between Daylight Studio and Eye-Comfort Night Study modes.
                </p>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 self-start ${
              theme === 'dark'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {theme === 'dark' ? 'Night Study Active' : 'Day Mode Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: Light Theme */}
            <button
              type="button"
              onClick={() => onSetTheme ? onSetTheme('light') : onToggleTheme?.()}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2.5 rounded-xl border ${
                    theme === 'light' ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <Sun className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Day Medical Studio (Light)</h4>
                    <span className="text-[11px] text-slate-500">Default Bright Aesthetic</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="p-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Crisp white and clean slate medical layout with soft highlights. Ideal for daylight, library study, and review sessions.
              </p>
            </button>

            {/* Option 2: Dark Theme */}
            <button
              type="button"
              onClick={() => onSetTheme ? onSetTheme('dark') : onToggleTheme?.()}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm text-slate-100'
                  : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-xs' : 'bg-slate-800 text-emerald-400 border-slate-700'
                  }`}>
                    <Moon className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Night Study (Dark Mode)</h4>
                    <span className="text-[11px] text-emerald-300/80">Eye Comfort & Low Light</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="p-1 rounded-full bg-emerald-500 text-slate-950 shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deep obsidian and dark emerald contrast for late-night revision sessions. Prevents eye strain during prolonged screen time.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACCOUNT SECURITY */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Account Overview Card */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Account Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your credentials and password security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px] font-medium">Logged-in Email</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {authUser?.email || 'Student Account'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[11px] font-medium">Multi-Tenant Isolation</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                    Active & Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keep your account secure with a strong password.
              </p>
            </div>

            {passSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{passSuccessMsg}</span>
              </div>
            )}
            {passErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{passErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Password (Min. 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isChangingPass ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Reset Study Data (Safe Danger Zone) */}
          {onResetToZero && (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Start Fresh / Reset Workspace
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Clears your personal progress, quiz attempts, and notes so you can start preparation from scratch with 0% progress.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset your study data and start completely from 0? This cannot be undone.')) {
                      setIsResetting(true);
                      await onResetToZero();
                      setIsResetting(false);
                    }
                  }}
                  className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all disabled:opacity-50 text-center cursor-pointer"
                >
                  {isResetting ? 'Resetting Workspace...' : 'Reset My Data to 0%'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
