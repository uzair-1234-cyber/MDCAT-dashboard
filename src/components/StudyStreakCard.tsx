import React from 'react';
import { Flame, Clock, Award, Play } from 'lucide-react';
import { StudyState } from '../types';

interface StudyStreakCardProps {
  studyState: StudyState;
  onOpenTimer: () => void;
}

export const StudyStreakCard: React.FC<StudyStreakCardProps> = ({ studyState, onOpenTimer }) => {
  const goal = studyState.todayGoalMinutes || 180;
  const completed = studyState.todayStudyMinutes || 0;
  const percentage = Math.min(Math.round((completed / goal) * 100), 100);
  const remaining = Math.max(goal - completed, 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Subtle amber/emerald top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500" />

      <div>
        {/* Top Header Row: Label & Study Now Button */}
        <div className="flex items-center justify-between mb-2 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Daily Streak
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenTimer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Study Now</span>
          </button>
        </div>

        {/* Streak Stat Display */}
        <div className="flex items-baseline gap-2 mt-1 mb-1">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {studyState.dailyStreak} {studyState.dailyStreak === 1 ? 'Day' : 'Days'}
          </span>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
            {studyState.dailyStreak > 0 ? 'Active Streak' : 'Day 0 · Start Today'}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          {studyState.dailyStreak > 0
            ? 'Great discipline! Keep the consistency alive.'
            : 'Ignite your medical preparation streak today!'}
        </p>
      </div>

      {/* Progress Bar & Details */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Focus: <span className="text-slate-900 font-bold ml-1">{completed}m</span> / {goal}m
          </span>
          <span className="text-emerald-700 font-bold">{percentage}%</span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-0.5 text-[11px] text-slate-500">
          <span>{remaining === 0 ? '🎉 Goal achieved!' : `${remaining}m to goal`}</span>
          <span className="font-medium text-emerald-600 flex items-center gap-1">
            <Award className="w-3 h-3" /> Every minute counts
          </span>
        </div>
      </div>
    </div>
  );
};
