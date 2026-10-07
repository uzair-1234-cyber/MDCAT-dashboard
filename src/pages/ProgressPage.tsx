import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  Stethoscope,
  BarChart2,
  Calendar,
  Sparkles,
  Plus,
  GraduationCap,
  BookOpen,
  Filter,
  X,
  FileCheck2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseSchema, ChapterData, SubjectName, AcademicYear } from '../types';

interface ProgressPageProps {
  data: DatabaseSchema;
  onToggleChapterStatus: (chapterId: string, status?: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
  preselectedSubject?: string;
  onAddChapter?: (payload: {
    subject: SubjectName;
    chapterNumber?: number;
    title: string;
    topics?: string[];
    classYear?: AcademicYear;
  }) => Promise<void>;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  data,
  onToggleChapterStatus,
  preselectedSubject,
  onAddChapter,
}) => {
  const [activeSubjectTab, setActiveSubjectTab] = useState<SubjectName>(
    (preselectedSubject as SubjectName) || 'Biology'
  );
  const [selectedYear, setSelectedYear] = useState<'All' | '1st Year' | '2nd Year'>('All');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State for Adding Chapters (specifically 2nd Year)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState<SubjectName>(activeSubjectTab);
  const [newYear, setNewYear] = useState<AcademicYear>('2nd Year');
  const [newTitle, setNewTitle] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newTopics, setNewTopics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const totalChapters = data.chapters.length;
  const completedChapters = data.chapters.filter((c) => c.completed).length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // 1st Year vs 2nd Year Stats
  const firstYearChapters = data.chapters.filter((c) => (c.classYear || '1st Year') === '1st Year');
  const firstYearCompleted = firstYearChapters.filter((c) => c.completed).length;
  const firstYearProgress = firstYearChapters.length > 0 ? Math.round((firstYearCompleted / firstYearChapters.length) * 100) : 0;

  const secondYearChapters = data.chapters.filter((c) => c.classYear === '2nd Year');
  const secondYearCompleted = secondYearChapters.filter((c) => c.completed).length;
  const secondYearProgress = secondYearChapters.length > 0 ? Math.round((secondYearCompleted / secondYearChapters.length) * 100) : 0;

  const totalMCQs = data.mcqs.length;
  const totalQuizzes = data.quizAttempts.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(data.quizAttempts.reduce((acc, q) => acc + q.scorePercentage, 0) / totalQuizzes)
      : 0;

  const realWeakTopics = Array.from(new Set(data.quizAttempts.flatMap((q) => q.weakTopics)));

  const handleToggle = async (ch: ChapterData) => {
    try {
      setTogglingId(ch.id);
      const newStatus = ch.completed ? 'in_progress' : 'completed';
      await onToggleChapterStatus(ch.id, newStatus);
      if (newStatus === 'completed') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const getSubjectStats = (name: SubjectName, yearFilter: 'All' | '1st Year' | '2nd Year' = 'All') => {
    let list = data.chapters.filter((c) => c.subject.toLowerCase() === name.toLowerCase());
    if (yearFilter !== 'All') {
      list = list.filter((c) => (c.classYear || '1st Year') === yearFilter);
    }
    const comp = list.filter((c) => c.completed).length;
    const pct = list.length > 0 ? Math.round((comp / list.length) * 100) : 0;
    return { total: list.length, completed: comp, percent: pct };
  };

  const currentSubjectChapters = data.chapters
    .filter((c) => c.subject.toLowerCase() === activeSubjectTab.toLowerCase())
    .filter((c) => {
      if (selectedYear === 'All') return true;
      return (c.classYear || '1st Year') === selectedYear;
    });

  const handleSaveNewChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Chapter title is required.');
      return;
    }
    if (!onAddChapter) {
      setFormError('Adding chapters is not enabled in this environment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      const parsedTopics = newTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onAddChapter({
        subject: newSubject,
        chapterNumber: newNumber ? parseInt(newNumber, 10) : undefined,
        title: newTitle.trim(),
        topics: parsedTopics.length > 0 ? parsedTopics : ['Key Concepts', 'Core Formulas / Terms'],
        classYear: newYear,
      });

      // Reset and close
      setNewTitle('');
      setNewNumber('');
      setNewTopics('');
      setIsAddModalOpen(false);
      if (newYear === '2nd Year') {
        setSelectedYear('2nd Year');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Medical Preparation Progress</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track syllabus completion across <span className="font-semibold text-slate-700">First Year (Class XI)</span> and <span className="font-semibold text-slate-700">Second Year (Class XII)</span> for your dream medical college.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            Class 11 & 12 MDCAT System
          </span>
          {onAddChapter && (
            <button
              onClick={() => {
                setNewSubject(activeSubjectTab);
                setNewYear('2nd Year');
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#0A201B] hover:bg-[#13352D] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              + Add Chapter
            </button>
          )}
        </div>
      </div>

      {/* Top 4 Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total MDCAT Syllabus</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">All Years</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallProgress}%</span>
            <span className="text-xs text-slate-400 font-semibold">{completedChapters}/{totalChapters} Chapters</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* 1st Year (Class XI) Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-b from-white to-emerald-50/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-800">1st Year (Class XI)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {firstYearChapters.length} Ch
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">{firstYearProgress}%</span>
            <span className="text-xs text-slate-500 font-semibold">{firstYearCompleted}/{firstYearChapters.length} Done</span>
          </div>
          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${firstYearProgress}%` }} />
          </div>
        </div>

        {/* 2nd Year (Class XII) Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-xs bg-gradient-to-b from-white to-purple-50/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-purple-800">2nd Year (Class XII)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              {secondYearChapters.length > 0 ? `${secondYearChapters.length} Ch` : 'Ready to Add'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {secondYearChapters.length > 0 ? `${secondYearProgress}%` : 'Hub Ready'}
            </span>
            <span className="text-xs text-purple-600 font-semibold">
              {secondYearChapters.length > 0 ? `${secondYearCompleted}/${secondYearChapters.length} Done` : 'Awaiting list'}
            </span>
          </div>
          <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.max(secondYearProgress, secondYearChapters.length > 0 ? 5 : 0)}%` }} />
          </div>
        </div>

        {/* Daily Streak & Quiz Accuracy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Streak & Accuracy</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
              🔥 {data.studyState.dailyStreak} Days
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-amber-600">{avgQuizScore}%</span>
            <span className="text-xs text-slate-400 font-semibold">{totalQuizzes} Tests Taken</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {totalMCQs} MCQs solved in question bank
          </p>
        </div>
      </div>

      {/* Subject-Wise Progress Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sindh Board Medical Subject Progress</h3>
            <p className="text-xs text-slate-500">Click on any subject to explore its full chapter breakdown.</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs">
            <button
              onClick={() => setSelectedYear('All')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedYear === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All MDCAT
            </button>
            <button
              onClick={() => setSelectedYear('1st Year')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedYear === '1st Year' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1st Year (XI)
            </button>
            <button
              onClick={() => setSelectedYear('2nd Year')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedYear === '2nd Year' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2nd Year (XII)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Biology', 'Chemistry', 'Physics', 'English'] as const).map((s) => {
            const stats = getSubjectStats(s, selectedYear);
            const isSelected = activeSubjectTab === s;

            return (
              <div
                key={s}
                onClick={() => setActiveSubjectTab(s)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-cyan-500/30'
                    : 'bg-slate-50/60 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">{s}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {stats.percent}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-700'}`}
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{stats.completed} / {stats.total} Chapters</span>
                  <span className="text-[10px] font-semibold">{selectedYear}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Chapter Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Checklist Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {activeSubjectTab} Chapter Checklist
              </h3>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                selectedYear === '2nd Year'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : selectedYear === '1st Year'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-cyan-50 text-cyan-800 border-cyan-200'
              }`}>
                {selectedYear === 'All' ? '1st & 2nd Year' : selectedYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click checkbox to mark chapters completed or in progress. Synchronized in real-time.
            </p>
          </div>

          {/* Action Row: Year Tabs + Add Chapter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedYear('All')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === 'All' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({getSubjectStats(activeSubjectTab, 'All').total})
              </button>
              <button
                onClick={() => setSelectedYear('1st Year')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === '1st Year' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1st Year ({getSubjectStats(activeSubjectTab, '1st Year').total})
              </button>
              <button
                onClick={() => setSelectedYear('2nd Year')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === '2nd Year' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2nd Year ({getSubjectStats(activeSubjectTab, '2nd Year').total})
              </button>
            </div>

            {onAddChapter && (
              <button
                onClick={() => {
                  setNewSubject(activeSubjectTab);
                  setNewYear('2nd Year');
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Add 2nd Year chapter"
              >
                <Plus className="w-3.5 h-3.5" />
                Add {activeSubjectTab} Ch
              </button>
            )}
          </div>
        </div>

        {/* Empty state when 2nd Year is selected and no chapters are present yet */}
        {currentSubjectChapters.length === 0 && selectedYear === '2nd Year' && (
          <div className="py-12 px-6 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-200/80 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-base font-bold text-slate-900">
                Class XII (2nd Year) {activeSubjectTab} Hub is Ready!
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The Second Year system is active across the platform. You can provide your Second Year chapters in the conversation or click below to add them directly.
              </p>
            </div>
            {onAddChapter && (
              <button
                onClick={() => {
                  setNewSubject(activeSubjectTab);
                  setNewYear('2nd Year');
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First 2nd Year {activeSubjectTab} Chapter
              </button>
            )}
          </div>
        )}

        {/* Chapters list */}
        {currentSubjectChapters.length > 0 && (
          <div className="divide-y divide-slate-100">
            {currentSubjectChapters.map((ch) => {
              const isCompleted = ch.completed;
              const isToggling = togglingId === ch.id;
              const yearTag = ch.classYear || '1st Year';

              return (
                <div
                  key={ch.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggle(ch)}
                      disabled={isToggling}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-cyan-500 bg-white'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold transition-colors ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-cyan-800'
                          }`}
                        >
                          Chapter {ch.chapterNumber}: {ch.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            yearTag === '2nd Year'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {yearTag}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>{ch.topics.length} Key Topics</span>
                        <span>•</span>
                        <span>{ch.mcqsCount} MCQs Available</span>
                        <span>•</span>
                        <span className="text-slate-400">{ch.topics.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ch.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'Completed' : ch.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Chapter Modal (Modal for 1st Year / 2nd Year) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add MDCAT Syllabus Chapter</h3>
                  <p className="text-xs text-slate-500">Add 1st Year or 2nd Year chapters to your study tracker.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNewChapter} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Academic Year</label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value as AcademicYear)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="2nd Year">2nd Year (Class XII)</option>
                    <option value="1st Year">1st Year (Class XI)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ch #</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 15"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chapter Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Homeostasis, Coordination & Control"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topics <span className="text-slate-400 font-normal">(optional, comma-separated)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Osmoregulation, Excretion, Thermoregulation"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
