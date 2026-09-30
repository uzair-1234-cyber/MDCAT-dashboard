/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { StudyMaterialPage } from './pages/StudyMaterialPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { GenerateMcqsPage } from './pages/GenerateMcqsPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { ProgressPage } from './pages/ProgressPage';
import { RevisionPlanPage } from './pages/RevisionPlanPage';
import { NotesPage } from './pages/NotesPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { MistakeBookPage } from './pages/MistakeBookPage';
import { PastPapersPage } from './pages/PastPapersPage';

import { StudyTimerModal } from './components/StudyTimerModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { UploadMaterialModal } from './components/UploadMaterialModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { api } from './services/api';
import { DatabaseSchema, DbStatus, SubjectName, StudyMaterial, MCQ, QuizAttempt, StudyNote, RevisionPlanItem, UserProfile } from './types';
import { Stethoscope, Heart, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DatabaseSchema | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-page state transfers
  const [activeSubject, setActiveSubject] = useState<string | undefined>(undefined);
  const [preselectedMaterialForAI, setPreselectedMaterialForAI] = useState<StudyMaterial | null>(null);
  const [customQuizMCQs, setCustomQuizMCQs] = useState<MCQ[] | null>(null);
  const [customQuizMeta, setCustomQuizMeta] = useState<{ subject: string; chapter: string } | null>(null);

  // Modals
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'info' | 'doctor' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'doctor' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('mediprep_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (_) {
      return 'light';
    }
  });

  // Apply Theme to documentElement & localStorage
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
      localStorage.setItem('mediprep_theme', theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(
        next === 'dark'
          ? '🌙 Night Mode Activated (Eye Comfort)'
          : '☀️ Day Mode Activated (Light Theme)',
        'info'
      );
      return next;
    });
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === theme) return;
    setTheme(newTheme);
    showToast(
      newTheme === 'dark'
        ? '🌙 Night Mode Activated (Eye Comfort)'
        : '☀️ Day Mode Activated (Light Theme)',
      'info'
    );
  };

  // Initial Data Load
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await api.getInit();
      setData(res.data);
      setDbStatus(res.status);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setLoadError(err?.message || 'Could not connect to MediPrep server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut for Cmd+K Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenSubject = (subject: SubjectName) => {
    setActiveSubject(subject);
    setCurrentTab('progress');
  };

  const handleAskAboutMaterial = (mat: StudyMaterial) => {
    setPreselectedMaterialForAI(mat);
    setCurrentTab('assistant');
  };

  const handleUploadSuccess = async (payload: any) => {
    const newMat = await api.createMaterial(payload);
    setData((prev) => (prev ? { ...prev, materials: [newMat, ...prev.materials] } : prev));
    showToast(`Saved & Indexed "${newMat.title}"!`, 'success');
  };

  const handleDeleteMaterial = async (id: string) => {
    await api.deleteMaterial(id);
    setData((prev) =>
      prev ? { ...prev, materials: prev.materials.filter((m) => m.id !== id) } : prev
    );
    showToast('Material removed from library.', 'info');
  };

  const handleToggleChapter = async (
    chapterId: string,
    status?: 'not_started' | 'in_progress' | 'completed'
  ) => {
    const updated = await api.toggleChapterStatus(chapterId, status);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map((c) => (c.id === chapterId ? updated : c)),
      };
    });
    if (updated.completed) {
      showToast('One chapter closer to your white coat! 🩺', 'doctor');
    }
  };

  const handleLogStudyMinutes = async (minutes: number) => {
    const updatedState = await api.logStudySession(minutes);
    setData((prev) => (prev ? { ...prev, studyState: updatedState } : prev));
    showToast(`Logged ${minutes} mins of deep study towards your dream!`, 'doctor');
  };

  const handleSaveMCQsToBank = async (mcqsToSave: MCQ[]) => {
    await api.saveBulkMCQs(mcqsToSave);
    setData((prev) => (prev ? { ...prev, mcqs: [...mcqsToSave, ...prev.mcqs] } : prev));
    showToast(`Saved ${mcqsToSave.length} MCQs to question bank!`, 'success');
  };

  const handleStartQuizWithMCQs = (mcqsList: MCQ[], subjectName: string, chapterName: string) => {
    setCustomQuizMCQs(mcqsList);
    setCustomQuizMeta({ subject: subjectName, chapter: chapterName });
    setCurrentTab('quizzes');
  };

  const handleQuizCompleted = async (attempt: QuizAttempt) => {
    const newMistakes = (attempt as any).allMistakes;
    if (newMistakes && Array.isArray(newMistakes)) {
      setData((prev) => (prev ? { ...prev, quizAttempts: [attempt, ...prev.quizAttempts], mistakes: newMistakes } : prev));
    } else {
      try {
        const freshMistakes = await api.getMistakes();
        setData((prev) => (prev ? { ...prev, quizAttempts: [attempt, ...prev.quizAttempts], mistakes: freshMistakes } : prev));
      } catch (e) {
        setData((prev) => (prev ? { ...prev, quizAttempts: [attempt, ...prev.quizAttempts] } : prev));
      }
    }

    if (attempt.scorePercentage >= 70) {
      showToast('Your consistency is starting to show! Excellent score.', 'doctor');
    } else {
      showToast('No problem! Mistakes show you what to revise next.', 'info');
    }
  };

  const handleRecordMistake = async (payload: any) => {
    try {
      const res = await api.recordMistake(payload);
      if (res.mistakes) {
        setData((prev) => (prev ? { ...prev, mistakes: res.mistakes } : prev));
      }
      showToast('Recorded to your Mistake Book!', 'info');
    } catch (err: any) {
      console.error('Failed to record mistake:', err);
    }
  };

  const handleAddNote = async (notePayload: Partial<StudyNote>) => {
    const newNote = await api.createNote(notePayload);
    setData((prev) => (prev ? { ...prev, notes: [newNote, ...prev.notes] } : prev));
    showToast(`Saved study note: "${newNote.title}"`, 'success');
  };

  const handleUpdateNote = async (id: string, notePayload: Partial<StudyNote>) => {
    const updated = await api.updateNote(id, notePayload);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? updated : n)),
      };
    });
  };

  const handleDeleteNote = async (id: string) => {
    await api.deleteNote(id);
    setData((prev) => (prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== id) } : prev));
    showToast('Note deleted.', 'info');
  };

  const handleAddPlan = async (item: Partial<RevisionPlanItem>) => {
    const newPlan = await api.createRevisionPlan(item);
    setData((prev) => (prev ? { ...prev, revisionPlans: [newPlan, ...prev.revisionPlans] } : prev));
    showToast('Added revision target to schedule!', 'success');
  };

  const handleUpdatePlan = async (id: string, item: Partial<RevisionPlanItem>) => {
    const updated = await api.updateRevisionPlan(id, item);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        revisionPlans: prev.revisionPlans.map((p) => (p.id === id ? updated : p)),
      };
    });
  };

  const handleDeletePlan = async (id: string) => {
    await api.deleteRevisionPlan(id);
    setData((prev) =>
      prev ? { ...prev, revisionPlans: prev.revisionPlans.filter((p) => p.id !== id) } : prev
    );
    showToast('Revision task removed.', 'info');
  };

  const handleResetToZero = async () => {
    const res = await api.resetData();
    setData(res.data);
    setDbStatus(res.status);
    showToast('All study data reset to 0! Ready for your fresh start.', 'doctor');
  };

  const handleToggleMCQBookmark = async (id: string) => {
    const updated = await api.toggleMCQBookmark(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        mcqs: prev.mcqs.map((m) => (m.id === id ? updated : m)),
      };
    });
  };

  const handleToggleMCQDifficult = async (id: string) => {
    const updated = await api.toggleMCQDifficult(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        mcqs: prev.mcqs.map((m) => (m.id === id ? updated : m)),
      };
    });
  };

  const handleUpdateUserProfile = async (updated: Partial<UserProfile>) => {
    try {
      const res = await api.updateUserProfile(updated);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userProfile: res.userProfile,
        };
      });
      showToast(`Profile updated: ${res.userProfile.name} • ${res.userProfile.dreamMedicalCollege.split(' ')[0]}`, 'doctor');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'info');
      throw err;
    }
  };

  if (loading || !data) {
    if (loadError && !loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 space-y-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center ring-2 ring-rose-400/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-xl font-bold tracking-tight">Connection Issue</h2>
            <p className="text-xs text-rose-300 font-medium">{loadError}</p>
          </div>
          <button
            onClick={loadData}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center ring-2 ring-cyan-400/30 animate-bounce">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight">MediPrep AI</h2>
          <p className="text-xs text-cyan-300 font-medium">
            Loading Sindh Board Medical Command Center...
          </p>
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#070e14] text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold ${
              toastMessage.type === 'doctor'
                ? 'bg-slate-900 text-white border-cyan-500/40 ring-2 ring-cyan-500/20'
                : toastMessage.type === 'info'
                ? 'bg-white dark:bg-[#121E28] text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shadow-md'
                : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {toastMessage.type === 'doctor' ? (
              <Stethoscope className="w-4 h-4 text-cyan-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveSubject(undefined);
          setCurrentTab(tab);
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeSubject={activeSubject}
        onClearSubject={() => setActiveSubject(undefined)}
        mistakesCount={data.mistakes ? data.mistakes.filter((m) => !m.mastered).length : 0}
        userProfile={data.userProfile}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenTimer={() => setTimerModalOpen(true)}
          onSelectTab={setCurrentTab}
          timerActive={false}
          studyMinutesToday={data.studyState.todayStudyMinutes}
          userProfile={data.userProfile}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSelectTheme={handleSetTheme}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 sm:pb-24 lg:pb-12 max-w-7xl w-full mx-auto overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardPage
              data={data}
              onSelectTab={setCurrentTab}
              onOpenSubject={handleOpenSubject}
              onOpenTimer={() => setTimerModalOpen(true)}
              onOpenUpload={() => setUploadModalOpen(true)}
              onOpenNewNote={() => setCurrentTab('notes')}
              onOpenNewRevision={() => setCurrentTab('revision')}
              onStartMistakeDrill={(mcqs, title) => {
                if (mcqs && mcqs.length > 0) {
                  setCustomQuizMCQs(mcqs);
                  setCustomQuizMeta({ subject: 'Mistakes Drill', chapter: title || 'Error Bank Review' });
                  setCurrentTab('quizzes');
                  showToast(`Loaded ${mcqs.length} mistake questions for test!`, 'doctor');
                } else {
                  setCurrentTab('mistakes');
                }
              }}
            />
          )}

          {currentTab === 'mistakes' && (
            <MistakeBookPage
              mistakes={data.mistakes || []}
              onUpdateMistakes={loadData}
              onLaunchMistakeQuiz={(mcqs, quizTitle) => {
                setCustomQuizMCQs(mcqs);
                setCustomQuizMeta({ subject: 'Mistakes Drill', chapter: quizTitle });
                setCurrentTab('quizzes');
                showToast(`Loaded ${mcqs.length} mistake questions for test!`, 'doctor');
              }}
            />
          )}

          {currentTab === 'pastpapers' && (
            <PastPapersPage
              chapters={data.chapters}
              preselectedSubject={activeSubject as SubjectName}
              onStartQuizWithMCQs={(mcqs, title, subj) => {
                setCustomQuizMCQs(mcqs);
                setCustomQuizMeta({ subject: subj, chapter: title });
                setCurrentTab('quizzes');
                showToast(`Loaded ${mcqs.length} past paper questions into test interface!`, 'doctor');
              }}
              onSaveMCQsToBank={handleSaveMCQsToBank}
            />
          )}

          {currentTab === 'materials' && (
            <StudyMaterialPage
              materials={data.materials}
              chapters={data.chapters}
              selectedSubject={activeSubject}
              onOpenUpload={() => setUploadModalOpen(true)}
              onDeleteMaterial={handleDeleteMaterial}
              onAskAboutMaterial={handleAskAboutMaterial}
            />
          )}

          {currentTab === 'assistant' && (
            <AiAssistantPage
              chapters={data.chapters}
              materials={data.materials}
              preselectedMaterial={preselectedMaterialForAI}
              onSaveAsNote={async (noteTitle, subj, ch, body) => {
                await handleAddNote({
                  title: noteTitle,
                  subject: subj,
                  chapter: ch,
                  content: body,
                  tags: ['AI Assistant', 'MDCAT Summary'],
                });
              }}
              onNavigateToMCQGen={(subj, chap) => {
                setActiveSubject(subj);
                setCurrentTab('mcqs');
              }}
            />
          )}

          {currentTab === 'mcqs' && (
            <GenerateMcqsPage
              chapters={data.chapters}
              materials={data.materials}
              preselectedSubject={activeSubject as SubjectName}
              onSaveMCQsToBank={handleSaveMCQsToBank}
              onStartQuizWithMCQs={handleStartQuizWithMCQs}
              onToggleBookmark={handleToggleMCQBookmark}
              onToggleDifficult={handleToggleMCQDifficult}
            />
          )}

          {currentTab === 'quizzes' && (
            <QuizzesPage
              mcqs={data.mcqs}
              chapters={data.chapters}
              quizAttempts={data.quizAttempts}
              onQuizCompleted={handleQuizCompleted}
              customQuizMCQs={customQuizMCQs}
              customQuizMeta={customQuizMeta}
              onClearCustomQuiz={() => {
                setCustomQuizMCQs(null);
                setCustomQuizMeta(null);
              }}
              onNavigateToMistakes={() => setCurrentTab('mistakes')}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressPage
              data={data}
              onToggleChapterStatus={handleToggleChapter}
              preselectedSubject={activeSubject}
            />
          )}

          {currentTab === 'revision' && (
            <RevisionPlanPage
              revisionPlans={data.revisionPlans}
              chapters={data.chapters}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {currentTab === 'notes' && (
            <NotesPage
              notes={data.notes}
              chapters={data.chapters}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentTab === 'bookmarks' && (
            <BookmarksPage
              mcqs={data.mcqs}
              notes={data.notes}
              materials={data.materials}
              onToggleMCQBookmark={handleToggleMCQBookmark}
              onToggleMCQDifficult={handleToggleMCQDifficult}
              onToggleNoteBookmark={(n) => handleUpdateNote(n.id, { bookmarked: !n.bookmarked })}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              status={dbStatus}
              userProfile={data.userProfile}
              theme={theme}
              onToggleTheme={toggleTheme}
              onSetTheme={handleSetTheme}
              onResetToZero={handleResetToZero}
              onRefreshStatus={loadData}
              onUpdateUserProfile={handleUpdateUserProfile}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <StudyTimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        onLogMinutes={handleLogStudyMinutes}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(tab, subj) => {
          if (subj) setActiveSubject(subj);
          setCurrentTab(tab);
        }}
      />

      <UploadMaterialModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        chapters={data.chapters}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveSubject(undefined);
          setCurrentTab(tab);
        }}
        onOpenMenu={() => setMobileMenuOpen(true)}
        mistakesCount={data.mistakes?.filter((m) => !m.mastered).length || 0}
      />
    </div>
  );
}
