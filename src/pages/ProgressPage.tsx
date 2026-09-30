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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseSchema, ChapterData, SubjectName } from '../types';

interface ProgressPageProps {
  data: DatabaseSchema;
  onToggleChapterStatus: (chapterId: string, status?: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
  preselectedSubject?: string;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  data,
  onToggleChapterStatus,
  preselectedSubject,
}) => {
  const [activeSubjectTab, setActiveSubjectTab] = useState<SubjectName>(
    (preselectedSubject as SubjectName) || 'Biology'
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const totalChapters = data.chapters.length;
  const completedChapters = data.chapters.filter((c) => c.completed).length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const totalMCQs = data.mcqs.length;
  const totalQuizzes = data.quizAttempts.length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(data.quizAttempts.reduce((acc, q) => acc + q.scorePercentage, 0) / totalQuizzes)
      : 0;

  const realWeakTopics = Array.from(new Set(data.quizAttempts.flatMap((q) => q.weakTopics)));
  const completedChapterTitles = data.chapters.filter((c) => c.completed).map((c) => c.title);

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

  const getSubjectStats = (name: SubjectName) => {
    const list = data.chapters.filter((c) => c.subject.toLowerCase() === name.toLowerCase());
    const comp = list.filter((c) => c.completed).length;
    const pct = list.length > 0 ? Math.round((comp / list.length) * 100) : 0;
    return { total: list.length, completed: comp, percent: pct };
  };

  const currentSubjectChapters = data.chapters.filter(
    (c) => c.subject.toLowerCase() === activeSubjectTab.toLowerCase()
  );

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const maxWeeklyMin = Math.max(...data.studyState.weeklyMinutes, 200);

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
            Track syllabus syllabus completion, weekly study volume, and quiz mastery towards your dream medical college.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            One chapter closer to your white coat
          </span>
        </div>
      </div>

      {/* Top 4 Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Overall Completion</span>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallProgress}%</span>
            <span className="text-xs text-slate-400 font-semibold">{completedChapters}/{totalChapters} Chapters</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total MCQs Solved</span>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalMCQs}</span>
            <span className={`text-xs font-semibold ${totalMCQs > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
              {totalMCQs > 0 ? 'MDCAT Bank' : '0 in Bank'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {totalMCQs > 0 ? 'Regular drill practice active' : 'Ready to generate first MCQs'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Avg Quiz Performance</span>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgQuizScore}%</span>
            <span className={`text-xs font-semibold ${totalQuizzes > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {totalQuizzes > 0 ? 'Diagnostic Accuracy' : '0 Tests Taken'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {totalQuizzes > 0 ? `Across ${totalQuizzes} simulated exams` : 'No quiz attempts recorded yet'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Current Study Streak</span>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-amber-600">🔥 {data.studyState.dailyStreak}</span>
            <span className="text-xs text-slate-500 font-semibold">
              {data.studyState.dailyStreak > 0 ? 'Days Active' : 'Day 0'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {data.studyState.dailyStreak > 0 ? 'Keep the streak alive!' : 'Start your day 1 session today!'}
          </p>
        </div>
      </div>

      {/* Subject-Wise Progress Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Sindh Board Medical Subject Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Biology', 'Chemistry', 'Physics', 'English'] as const).map((s) => {
            const stats = getSubjectStats(s);
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
                <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {stats.completed} of {stats.total} Chapters Completed
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Study Activity Chart & Strong/Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Minutes Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Study Volume</h3>
              <p className="text-xs text-slate-500">Minutes spent in focused medical preparation</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Last 7 Days
            </span>
          </div>

          <div className="flex items-end justify-between h-48 pt-6 px-2 gap-2 border-b border-slate-100">
            {data.studyState.weeklyMinutes.map((mins, idx) => {
              const heightPct = mins > 0 ? Math.max(Math.round((mins / maxWeeklyMin) * 100), 8) : 0;
              const isToday = idx === data.studyState.weeklyMinutes.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span
                    className={`text-[10px] font-bold transition-colors ${
                      mins > 0 ? 'text-slate-700 group-hover:text-cyan-700' : 'text-slate-300'
                    }`}
                  >
                    {mins}m
                  </span>
                  <div className="w-full max-w-[32px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                    {mins > 0 ? (
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isToday ? 'bg-gradient-to-t from-cyan-600 to-teal-400' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    ) : (
                      <div className="w-full h-1 bg-slate-200 rounded-full mb-0.5 mx-auto" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{daysOfWeek[idx]}</span>
                </div>
              );
            })}
          </div>
          <div className="pt-3 flex justify-between text-xs text-slate-400">
            <span>Weekly Target: 1,200 mins</span>
            <span
              className={`font-semibold ${
                data.studyState.weeklyMinutes.reduce((a, b) => a + b, 0) > 0
                  ? 'text-emerald-600'
                  : 'text-slate-500'
              }`}
            >
              {data.studyState.weeklyMinutes.reduce((a, b) => a + b, 0) > 0
                ? 'On Track'
                : '0 mins logged this week'}
            </span>
          </div>
        </div>

        {/* Strong vs Weak Topics Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">MDCAT Topic Mastery Analysis</h3>
            <p className="text-xs text-slate-500">Grounded in your real quiz attempts and completed chapters</p>
          </div>

          {data.quizAttempts.length === 0 && completedChapterTitles.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Starting from 0: Fresh Slate</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                As you complete chapters and attempt quizzes, your strong topics and target revision areas will be automatically mapped here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedChapterTitles.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed Chapter Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {completedChapterTitles.slice(0, 6).map((top, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        ✓ {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {realWeakTopics.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Target Revision Areas (From Quiz Errors)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {realWeakTopics.map((top, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        ! {top}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 font-medium">
            💡 Pro tip: Generate MCQs on any Sindh Board chapter to begin testing your mastery.
          </div>
        </div>
      </div>

      {/* Interactive Chapter Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activeSubjectTab} Chapter Completion Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Click the checkbox to mark chapters completed or in progress. Updates your progress tracker in real-time.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 self-start sm:self-auto">
            {getSubjectStats(activeSubjectTab).completed} / {getSubjectStats(activeSubjectTab).total} Done
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentSubjectChapters.map((ch) => {
            const isCompleted = ch.completed;
            const isToggling = togglingId === ch.id;

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
                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-cyan-800'
                      }`}
                    >
                      Chapter {ch.chapterNumber}: {ch.title}
                    </h4>
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
      </div>
    </div>
  );
};
