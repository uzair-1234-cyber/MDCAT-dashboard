import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Target,
  Quote,
  ShieldCheck,
  Lock,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Stethoscope,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { AuthUser } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onProfileUpdated: (updatedUser: AuthUser) => void;
  onLogout: () => void;
}

const MEDICAL_COLLEGES = [
  'Dow University of Health Sciences (DUHS, Karachi)',
  'King Edward Medical University (KEMU, Lahore)',
  'Liaquat University of Medical & Health Sciences (LUMHS, Jamshoro)',
  'Jinnah Sindh Medical University (JSMU / SMC, Karachi)',
  'Aga Khan University Medical College (AKU, Karachi)',
  'Chandka Medical College (CMC, Larkana)',
  'Peoples University of Medical & Health Sciences (PUMHSW, SBA)',
  'Nishtar Medical University (NMU, Multan)',
  'Rawalpindi Medical University (RMU)',
  'Khyber Medical College (KMC, Peshawar)',
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Edit Profile Form
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    aspirantType: currentUser.aspirantType || 'First-Year Sindh Board (XI Pre-Medical)',
    targetExam: currentUser.targetExam || 'MDCAT / NUMS',
    targetYear: currentUser.targetYear || '2026',
    dreamMedicalCollege: currentUser.dreamMedicalCollege || 'Dow University of Health Sciences (DUHS)',
    personalMotto: currentUser.personalMotto || 'Discipline Today → Doctor Tomorrow.',
  });

  // Password Change Form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await api.updateAuthProfile(formData);
      onProfileUpdated(res.user);
      setProfileSuccess('Profile goals & details updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);
    try {
      const res = await api.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      setPassSuccess(res.message || 'Password changed successfully!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccess(null), 3500);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#0E1A24] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#06241C] via-[#093528] to-[#0A263D] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-[#061814] rounded-[14px] overflow-hidden flex items-center justify-center text-xl font-black text-emerald-400">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Dr. {currentUser.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Student
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-[11px] text-emerald-300/70 mt-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{currentUser.dreamMedicalCollege}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#09131B] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#122331] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & MDCAT Goals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-[#122331] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700/60'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aspirant Class / Category
                  </label>
                  <input
                    type="text"
                    value={formData.aspirantType}
                    onChange={(e) => setFormData({ ...formData, aspirantType: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Exam & Year
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.targetExam}
                      onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                      className="w-2/3 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                    <input
                      type="text"
                      value={formData.targetYear}
                      onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                      className="w-1/3 px-2 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dream Medical College
                </label>
                <input
                  list="account-colleges-list"
                  type="text"
                  value={formData.dreamMedicalCollege}
                  onChange={(e) => setFormData({ ...formData, dreamMedicalCollege: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
                <datalist id="account-colleges-list">
                  {MEDICAL_COLLEGES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Doctor Motto
                </label>
                <input
                  type="text"
                  value={formData.personalMotto}
                  onChange={(e) => setFormData({ ...formData, personalMotto: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              {/* Data Isolation Badge */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#10202C] border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Data Privacy:</strong> Your account has its own isolated database store. All notes, tests, and mistakes belong exclusively to you.
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}
              {passError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (at least 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#12222F] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{changingPass ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
