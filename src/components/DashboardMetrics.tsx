import React from 'react';
import {
  Flame,
  Calendar,
  BookOpen,
  FileText,
  Target,
  ArrowRight,
} from 'lucide-react';
import { DatabaseSchema } from '../types';
import { NavTab } from './Sidebar';

interface DashboardMetricsProps {
  data: DatabaseSchema;
  onOpenTimer: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  data,
  onOpenTimer,
  onSelectTab,
}) => {
  const { studyState, chapters, mcqs } = data;

  // Daily Focus
  const streak = studyState?.dailyStreak || 0;
  const todayMins = studyState?.todayStudyMinutes || 0;
  const goalMins = studyState?.todayGoalMinutes || 180;
  const todayPercent = Math.min(Math.round((todayMins / Math.max(goalMins, 1)) * 100), 100);

  // Syllabus
  const totalChapters = chapters?.length || 35;
  const completedChapters = chapters?.filter((c) => c.completed).length || 0;
  const syllabusPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // MCQs
  const totalMCQs = mcqs?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ---------------------------------------------------- */}
      {/* CARD 1: DAILY FOCUS (Mint green card) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#F0F8F4] rounded-3xl p-6 border border-[#D5ECE0] shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          {/* Top row: Icon + Header + Calendar button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white text-emerald-600 shadow-2xs border border-emerald-100">
                <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                DAILY FOCUS
              </span>
            </div>
            <button
              onClick={onOpenTimer}
              className="p-2 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-100 shadow-2xs transition-colors"
              title="Open Focus Schedule & Timer"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* Big number + Status badge */}
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {streak} Days
            </span>
            <span className="text-xs font-bold text-[#14532D] bg-[#DCF0E4] px-2.5 py-0.5 rounded-full border border-[#C2E4CD]">
              {streak > 0 ? 'Active Streak' : 'Start Today'}
            </span>
          </div>

          {/* Subtitle / daily goal */}
          <p className="text-xs text-slate-600 font-medium mb-3">
            {todayMins}m / {goalMins}m daily goal ({todayPercent}%)
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-[#DEEEE4] rounded-full h-2 overflow-hidden mb-4">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(todayPercent, 4)}%` }}
            />
          </div>
        </div>

        {/* Motivational quote at bottom */}
        <p className="text-xs text-slate-500 italic pt-2 border-t border-[#DEEEE4]/60">
          &ldquo;Discipline today builds your future tomorrow.&rdquo;
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CARD 2: SYLLABUS (Sky blue card) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#F0F7FD] rounded-3xl p-6 border border-[#D5E7FA] shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          {/* Top row: Icon + Header + Document icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white text-blue-600 shadow-2xs border border-blue-100">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                SYLLABUS
              </span>
            </div>
            <button
              onClick={() => onSelectTab('progress')}
              className="p-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 border border-blue-100 shadow-2xs transition-colors"
              title="View Chapters & Syllabus"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* Big number + Status badge */}
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {completedChapters} / {totalChapters}
            </span>
            <span className="text-xs font-bold text-[#1E40AF] bg-[#E0EFFE] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
              {syllabusPercent}% Done
            </span>
          </div>

          {/* Subtitle with 1st & 2nd Year tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-600 mb-3">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              1st Year: {chapters?.filter((c) => (c.classYear || '1st Year') === '1st Year').length || 0} Ch
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              2nd Year: {chapters?.filter((c) => c.classYear === '2nd Year').length || 0 > 0 ? `${chapters?.filter((c) => c.classYear === '2nd Year').length} Ch` : 'System Ready'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#DCEAF8] rounded-full h-2 overflow-hidden mb-4">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(syllabusPercent, 4)}%` }}
            />
          </div>
        </div>

        {/* Action Link at bottom */}
        <button
          onClick={() => onSelectTab('progress')}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline pt-2 border-t border-[#DCEAF8]/60 self-start"
        >
          <span>View Chapters</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CARD 3: MCQS (Lavender purple card) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#F6F4FE] rounded-3xl p-6 border border-[#E5DEFA] shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          {/* Top row: Icon + Header + Target watermark */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white text-purple-600 shadow-2xs border border-purple-100">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                MCQs
              </span>
            </div>
            <span className="p-2 rounded-xl bg-white text-purple-400 border border-purple-100 shadow-2xs">
              <Target className="w-4 h-4" />
            </span>
          </div>

          {/* Big number + Status badge */}
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalMCQs}
            </span>
            <span className="text-xs font-bold text-[#5B21B6] bg-[#EDE9FE] px-2.5 py-0.5 rounded-full border border-[#DDD6FE]">
              Available
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-600 font-medium mb-3">
            Practice makes perfect
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-[#E8E1F8] rounded-full h-2 overflow-hidden mb-4">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(totalMCQs, 100)}%` }}
            />
          </div>
        </div>

        {/* Action Link at bottom */}
        <button
          onClick={() => onSelectTab('mcqs')}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline pt-2 border-t border-[#E8E1F8]/60 self-start"
        >
          <span>Start Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
