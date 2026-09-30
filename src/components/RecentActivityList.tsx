import React from 'react';
import {
  Sparkles,
  ClipboardCheck,
  Upload,
  FileText,
  Bot,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ActivityItem } from '../types';

interface RecentActivityListProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'mcq_generated':
        return { icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-200/80' };
      case 'quiz_completed':
        return { icon: ClipboardCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80' };
      case 'pdf_uploaded':
        return { icon: Upload, color: 'text-blue-600 bg-blue-50 border-blue-200/80' };
      case 'note_created':
        return { icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200/80' };
      case 'ai_question':
        return { icon: Bot, color: 'text-teal-600 bg-teal-50 border-teal-200/80' };
      case 'chapter_completed':
        return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80' };
      default:
        return { icon: Clock, color: 'text-slate-600 bg-slate-50 border-slate-200/80' };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Recent Study Activity</h2>
          <p className="text-xs text-slate-500">Timeline of your study sessions, quizzes, and notes</p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
          Live Log
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.slice(0, 5).map((act) => {
          const { icon: Icon, color } = getActivityIcon(act.type);
          return (
            <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3.5 group">
              <span className={`p-2 rounded-xl border shrink-0 mt-0.5 ${color}`}>
                <Icon className="w-4 h-4" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                    {act.title}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{act.description}</p>
                {act.subject && (
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                    {act.subject}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            No study activity logged yet. Start studying or take a practice drill!
          </div>
        )}
      </div>
    </div>
  );
};
