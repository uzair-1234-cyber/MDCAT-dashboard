import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Server,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  FolderOpen,
  FileQuestion,
  BookOpen,
  Trophy,
  AlertOctagon,
  Trash2,
  HardDrive,
  Cpu,
  Pencil,
  X,
  Save,
  User,
  Target,
  GraduationCap,
  Quote,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { DbStatus, UserProfile } from '../types';
import { api } from '../services/api';

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
];

const TARGET_PRESETS = [
  { exam: 'MDCAT / NUMS', year: '2026', label: 'MDCAT / NUMS (2026)' },
  { exam: 'Sindh MDCAT', year: '2026', label: 'Sindh MDCAT (2026)' },
  { exam: 'NUMS Armed Forces', year: '2026', label: 'NUMS Cadet (2026)' },
  { exam: 'UHS Punjab MDCAT', year: '2026', label: 'Punjab MDCAT (2026)' },
  { exam: 'MDCAT Repeater / Improver', year: '2025', label: 'MDCAT Repeater (2025)' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  status,
  userProfile,
  theme = 'light',
  onToggleTheme,
  onSetTheme,
  onResetToZero,
  onRefreshStatus,
  onUpdateUserProfile,
}) => {
  const [testUri, setTestUri] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedCluster, setCopiedCluster] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: userProfile?.name || 'Uzair Korejo',
    targetExam: userProfile?.targetExam || 'MDCAT / NUMS',
    targetYear: userProfile?.targetYear || '2026',
    dreamMedicalCollege: userProfile?.dreamMedicalCollege || 'Dow University of Health Sciences (DUHS, Karachi)',
    personalMotto: userProfile?.personalMotto || 'Future Doctor in the making — Dedication, Focus, Success.',
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        targetExam: userProfile.targetExam || '',
        targetYear: userProfile.targetYear || '',
        dreamMedicalCollege: userProfile.dreamMedicalCollege || '',
        personalMotto: userProfile.personalMotto || '',
      });
    }
  }, [userProfile]);

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
        targetExam: formData.targetExam.trim(),
        targetYear: formData.targetYear.trim(),
        dreamMedicalCollege: formData.dreamMedicalCollege.trim(),
        personalMotto: formData.personalMotto.trim(),
      };

      if (onUpdateUserProfile) {
        await onUpdateUserProfile(payload);
      } else {
        await api.updateUserProfile(payload);
        if (onRefreshStatus) await onRefreshStatus();
      }

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
      name: userProfile?.name || '',
      targetExam: userProfile?.targetExam || '',
      targetYear: userProfile?.targetYear || '',
      dreamMedicalCollege: userProfile?.dreamMedicalCollege || '',
      personalMotto: userProfile?.personalMotto || '',
    });
    setProfileErrorMsg(null);
    setIsEditingProfile(false);
  };

  const handleSyncMongo = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      const res = await api.syncMongo();
      setSyncResult({ success: res.success, message: res.message });
      if (onRefreshStatus) await onRefreshStatus();
    } catch (err: any) {
      setSyncResult({ success: false, message: err?.message || 'Sync failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUri.trim()) return;

    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.testMongoConnection(testUri.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(
      'MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME'
    );
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopyCluster = (uri: string) => {
    navigator.clipboard.writeText(uri);
    setCopiedCluster(true);
    setTimeout(() => setCopiedCluster(false), 2000);
  };

  const materialsCount = status?.mongoCollectionCounts?.materials ?? status?.totalMaterials ?? 0;
  const mcqsCount = status?.mongoCollectionCounts?.mcqs ?? status?.totalMCQs ?? 0;
  const notesCount = status?.mongoCollectionCounts?.notes ?? status?.totalNotes ?? 0;
  const quizzesCount = status?.mongoCollectionCounts?.quizAttempts ?? status?.quizzesAttempted ?? 0;
  const mistakesCount = status?.mongoCollectionCounts?.mistakes ?? status?.totalMistakes ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fadeIn pb-16 sm:pb-12 max-w-5xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="p-2 sm:p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200/80 shrink-0">
              <Database className="w-5 h-5 text-cyan-600" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                Settings & Database
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mt-0.5 sm:mt-1">
                Customize your medical aspirant profile, target college, and manage persistent MongoDB Atlas cluster.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Security Verified
          </span>
        </div>
      </div>

      {/* Study Theme & Visual Appearance Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <Palette className="w-5 h-5 text-amber-600" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Study Theme & Appearance (Dark / Light Mode)
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Switch between clean Day Medical Studio and Eye-Comfort Night Study modes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-emerald-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {theme === 'dark' ? 'Night Study Active' : 'Day Mode Active'}
            </span>
          </div>
        </div>

        {/* 2 Interactive Theme Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {/* Option 1: Light Theme */}
          <button
            type="button"
            onClick={() => onSetTheme ? onSetTheme('light') : onToggleTheme?.()}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group active:scale-[0.99] cursor-pointer ${
              theme === 'light'
                ? 'bg-[#F4F6F8] border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl border ${
                  theme === 'light' ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <Sun className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Light Theme (Day Mode)</h4>
                  <span className="text-[11px] text-slate-500">Default Medical Studio</span>
                </div>
              </div>
              {theme === 'light' && (
                <span className="p-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clean white & slate medical study environment with pastel category highlights. Ideal for bright daylight and classroom sessions.
            </p>
          </button>

          {/* Option 2: Dark Theme */}
          <button
            type="button"
            onClick={() => onSetTheme ? onSetTheme('dark') : onToggleTheme?.()}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group active:scale-[0.99] cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#091117] border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm text-slate-100'
                : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-xs' : 'bg-slate-800 text-emerald-400 border-slate-700'
                }`}>
                  <Moon className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Dark Theme (Night Study)</h4>
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
              Deep obsidian & dark emerald slate with glowing readable contrast. Relieves eye strain during late-night revision and saves device battery.
            </p>
          </button>
        </div>
      </div>

      {/* Medical Aspirant Identity Card (With Edit Option for 3 Fields) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Card Header & Edit Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-emerald-500/30 shadow-xs shrink-0 bg-white">
              <img
                src="/logo.jpg"
                alt="Medical Aspirant Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Medical Aspirant Identity
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  Verified Candidate
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Official Profile & Sindh MDCAT Candidate Details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 transition-all shadow-2xs touch-manipulation cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Profile Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode vs Edit Mode */}
        {!isEditingProfile ? (
          <>
            {/* The 3 Student Fields in View Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 text-xs">
              {/* 1. Full Name */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 min-w-0 relative group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" />
                    Full Name
                  </span>
                </div>
                <span className="text-slate-900 font-bold text-sm block truncate mt-1">
                  {userProfile.name}
                </span>
              </div>

              {/* 2. Aspirant Target */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 min-w-0 relative group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-cyan-600" />
                    Aspirant Target
                  </span>
                </div>
                <span className="text-cyan-800 font-bold text-sm block truncate mt-1">
                  {userProfile.targetExam} ({userProfile.targetYear})
                </span>
              </div>

              {/* 3. Dream Medical College */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 min-w-0 sm:col-span-1 relative group">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-purple-600" />
                    Dream Medical College
                  </span>
                </div>
                <span
                  className="text-slate-900 font-bold text-sm block truncate mt-1"
                  title={userProfile.dreamMedicalCollege}
                >
                  {userProfile.dreamMedicalCollege}
                </span>
              </div>
            </div>

            {/* Personal Motto Quote */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 text-xs text-cyan-900 font-medium italic break-words leading-relaxed flex items-start gap-2">
              <Quote className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>“{userProfile.personalMotto}”</span>
            </div>
          </>
        ) : (
          /* Edit Form for Students */
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 animate-fadeIn">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 font-medium">
              💡 Har student yahan apna <strong>Full Name</strong>, <strong>Aspirant Target</strong>, aur <strong>Dream Medical College</strong> apne mutabiq customize kar sakta hai.
            </div>

            {profileErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Full Name (Student Name)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Uzair Korejo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-2xs"
                />
                <p className="text-[11px] text-slate-400">
                  Yeh naam aapke dashboard, test results, aur reports par show hoga.
                </p>
              </div>

              {/* Field 2: Aspirant Target & Target Year */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                  <span>2. Aspirant Target & Exam Year</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.targetExam}
                    onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                    placeholder="e.g. MDCAT / NUMS"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-2xs"
                  />
                  <select
                    value={formData.targetYear}
                    onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                    className="w-24 sm:w-28 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                  </select>
                </div>
                {/* Target Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center">Quick pick:</span>
                  {TARGET_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          targetExam: preset.exam,
                          targetYear: preset.year,
                        })
                      }
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-slate-600 border border-slate-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Dream Medical College */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Dream Medical College</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dreamMedicalCollege}
                  onChange={(e) => setFormData({ ...formData, dreamMedicalCollege: e.target.value })}
                  placeholder="e.g. Dow University of Health Sciences (DUHS, Karachi)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all shadow-2xs"
                />

                {/* Popular Medical Colleges Quick Pick */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Popular Medical Colleges (Click to select):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {POPULAR_COLLEGES.map((college) => (
                      <button
                        key={college}
                        type="button"
                        onClick={() => setFormData({ ...formData, dreamMedicalCollege: college })}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-all text-left ${
                          formData.dreamMedicalCollege === college
                            ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-2xs'
                            : 'bg-slate-50 hover:bg-purple-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {college.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 4: Personal Motto / Motivation */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Personal Motto / Motivational Goal Quote</span>
                </label>
                <input
                  type="text"
                  value={formData.personalMotto}
                  onChange={(e) => setFormData({ ...formData, personalMotto: e.target.value })}
                  placeholder="e.g. Dedicated to serving humanity as a future doctor."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSavingProfile}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-50 touch-manipulation order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 touch-manipulation order-1 sm:order-2"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
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

      {/* MongoDB Database Status & Live Synced Stats */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sm:space-y-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                MongoDB Database Status
              </h3>
              <p className="text-[11px] text-slate-500 sm:hidden">
                Atlas Cluster & Cloud Collection State
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border self-start sm:self-auto shrink-0 shadow-2xs ${
              status?.connectedToMongo
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                status?.connectedToMongo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {status?.connectedToMongo ? 'Connected to MongoDB Cloud' : 'Operating on Synced Local Store'}
            </span>
          </span>
        </div>

        {/* Database Metrics and Mode Overview */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-3.5">
          {/* Active Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-500 text-xs">Active Storage Mode:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/90 self-start sm:self-auto text-xs break-all shadow-2xs">
              {status?.storageMode || 'Local Persistent Store (Synced)'}
            </span>
          </div>

          {/* Database Name */}
          {status?.databaseName && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <span className="font-semibold text-slate-500 text-xs">MongoDB Database Name:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/90 self-start sm:self-auto text-xs shadow-2xs">
                {status.databaseName}
              </span>
            </div>
          )}

          {/* Live Document Counts: Clean mobile grid */}
          <div className="space-y-2 pt-1 border-t border-slate-200/70">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600 text-xs">Live Cloud Documents in Mongo:</span>
              <span className="text-[10px] font-medium text-slate-400">Real-time sync</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700 shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">Materials</span>
                  <span className="text-sm font-bold text-slate-900">{materialsCount}</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">MCQs</span>
                  <span className="text-sm font-bold text-emerald-700">{mcqsCount}</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">Notes</span>
                  <span className="text-sm font-bold text-amber-700">{notesCount}</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">Quizzes</span>
                  <span className="text-sm font-bold text-purple-700">{quizzesCount}</span>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 min-w-0 col-span-2 sm:col-span-4 md:col-span-1">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 shrink-0">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 block font-medium truncate">Mistakes</span>
                  <span className="text-sm font-bold text-rose-700">{mistakesCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Synchronization Timestamp */}
          {status?.lastMongoSync && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs pt-1 border-t border-slate-200/70">
              <span className="font-semibold text-slate-500">Last Cloud Synchronization:</span>
              <span className="text-slate-700 font-medium">
                {new Date(status.lastMongoSync).toLocaleTimeString()} ({new Date(status.lastMongoSync).toLocaleDateString()})
              </span>
            </div>
          )}

          {/* Configured MongoDB Cluster with Copy Button */}
          {status?.maskedUri && (
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500 text-[11px]">Configured MongoDB Cluster:</span>
                <button
                  type="button"
                  onClick={() => handleCopyCluster(status.maskedUri || '')}
                  className="text-[10px] text-cyan-700 hover:text-cyan-800 font-medium flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  {copiedCluster ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCluster ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-800 font-semibold break-all select-all shadow-2xs leading-relaxed">
                {status.maskedUri}
              </div>
            </div>
          )}

          {/* Connection note */}
          {status?.lastError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px] break-words">
              Connection note: {status.lastError}
            </div>
          )}

          {/* Manual Sync Button */}
          {status?.connectedToMongo && (
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Aapka study data (images, PDFs, MCQs, notes) MongoDB Atlas cluster mein live persist ho rha hai.
              </p>
              <button
                type="button"
                onClick={handleSyncMongo}
                disabled={isSyncing}
                className="w-full sm:w-auto shrink-0 min-h-[44px] sm:min-h-[38px] inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing with MongoDB...' : 'Sync to MongoDB Now'}</span>
              </button>
            </div>
          )}

          {syncResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start sm:items-center gap-2 break-words ${
                syncResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="min-w-0">{syncResult.message}</span>
            </div>
          )}
        </div>

        {/* MongoDB Connection String Setup Guide */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>How to Connect Your Own MongoDB Database</span>
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed">
            Per your request, MongoDB credentials are <strong>never hardcoded</strong> into code or exposed in the frontend.
            Your study materials, MCQs, quiz attempts, progress, and study sessions are saved permanently.
          </p>

          <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 text-xs">Step 1: Get your connection string from MongoDB Atlas</p>
              <div className="mt-1.5 p-2 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-800 break-all select-all">
                mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-slate-900 text-xs">Step 2: Add it as an environment secret</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 text-cyan-400 p-2.5 sm:p-3 rounded-xl font-mono text-xs gap-2 min-w-0">
                <code className="break-all text-[11px] sm:text-xs">
                  MONGODB_URI="your_mongodb_connection_string"
                </code>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="self-end sm:self-auto shrink-0 text-xs text-white hover:text-cyan-300 bg-slate-800 sm:bg-transparent px-2.5 py-1 rounded-md flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-xs">Step 3: Test connection below</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enter your connection string below to verify connectivity and credentials before deploying.
              </p>
            </div>
          </div>
        </div>

        {/* Connection Tester Form */}
        <form onSubmit={handleTestConnection} className="space-y-2.5 pt-2">
          <label className="block text-xs font-bold text-slate-700">
            Test MongoDB Connection String
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={testUri}
              onChange={(e) => setTestUri(e.target.value)}
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/mediprep"
              className="w-full flex-1 px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-mono focus:bg-white focus:ring-2 focus:ring-cyan-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={testing || !testUri.trim()}
              className="w-full sm:w-auto shrink-0 px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
            >
              {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{testing ? 'Testing Handshake...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start sm:items-center gap-2 break-words ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="min-w-0">{testResult.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* AI Engine Security & Model Details */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              AI Engine Security (Gemini API)
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 self-start sm:self-auto shrink-0 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Model: gemini-3.1-flash-lite (Stable + Auto Failover)
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In strict accordance with system security rules, the Gemini API key is executed <strong>entirely server-side</strong> in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">server.ts</code> using <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">@google/genai</code> with automatic multi-model failover (gemini-3.1-flash-lite, gemini-flash-latest, gemini-3.8-flash) for maximum stability without 503 high-demand interruptions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block text-[11px] font-medium">Server SDK</span>
              <span className="font-bold text-slate-800 block truncate">@google/genai (v2.4.0)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block text-[11px] font-medium">Key Injection Method</span>
              <span className="font-bold text-slate-800 block truncate">AI Studio Environment Secret</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Start / Reset to 0 */}
      {onResetToZero && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Start from 0 / Reset Study Data
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wipes all study materials, MCQs, quiz attempts, and notes so you can start completely from scratch with 0% progress.
              </p>
            </div>
            <button
              type="button"
              disabled={isResetting}
              onClick={async () => {
                if (confirm('Are you sure you want to reset all data and start completely from 0? This cannot be undone.')) {
                  setIsResetting(true);
                  await onResetToZero();
                  setIsResetting(false);
                }
              }}
              className="w-full sm:w-auto shrink-0 min-h-[44px] sm:min-h-[38px] px-4 py-2.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-bold transition-all disabled:opacity-50 text-center touch-manipulation cursor-pointer"
            >
              {isResetting ? 'Resetting...' : 'Reset All to 0'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
