import React from 'react';
import {
  LayoutGrid,
  BookOpen,
  CheckSquare,
  Sparkles,
  Database,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface QuickActionsProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenNewNote: () => void;
  onOpenNewRevision: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectTab,
}) => {
  const tools = [
    {
      title: 'Study Material',
      desc: 'Access all chapters & notes',
      icon: BookOpen,
      iconColor: 'text-[#107C41]',
      cardBg: 'bg-[#EFF7F2] border-[#D4E7DC] hover:border-[#B2D8C0]',
      buttonBg: 'bg-[#107C41] hover:bg-[#0D6334]',
      action: () => onSelectTab('materials'),
    },
    {
      title: 'MCQs',
      desc: 'Practice with past papers',
      icon: CheckSquare,
      iconColor: 'text-[#2563EB]',
      cardBg: 'bg-[#EFF6FF] border-[#DBEAFE] hover:border-[#BFDBFE]',
      buttonBg: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
      action: () => onSelectTab('mcqs'),
    },
    {
      title: 'AI Tutor',
      desc: 'Get instant help with doubts',
      icon: Sparkles,
      iconColor: 'text-[#8B5CF6]',
      cardBg: 'bg-[#F5F3FF] border-[#EDE9FE] hover:border-[#DDD6FE]',
      buttonBg: 'bg-[#8B5CF6] hover:bg-[#7C3AED]',
      action: () => onSelectTab('assistant'),
    },
    {
      title: 'Question Bank',
      desc: 'Topic-wise questions',
      icon: Database,
      iconColor: 'text-[#D97706]',
      cardBg: 'bg-[#FFFBEB] border-[#FEF3C7] hover:border-[#FDE68A]',
      buttonBg: 'bg-[#D97706] hover:bg-[#B45309]',
      action: () => onSelectTab('quizzes'),
    },
    {
      title: 'Mistake Book',
      desc: 'Review your weak areas',
      icon: AlertTriangle,
      iconColor: 'text-[#E11D48]',
      cardBg: 'bg-[#FEF2F2] border-[#FEE2E2] hover:border-[#FECDD3]',
      buttonBg: 'bg-[#E11D48] hover:bg-[#BE123C]',
      action: () => onSelectTab('mistakes'),
    },
    {
      title: 'Progress',
      desc: 'Track your performance',
      icon: TrendingUp,
      iconColor: 'text-[#0D9488]',
      cardBg: 'bg-[#ECFEFF] border-[#CFFAFE] hover:border-[#A5F3FC]',
      buttonBg: 'bg-[#0D9488] hover:bg-[#0F766E]',
      action: () => onSelectTab('progress'),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
      {/* Header matching reference image: Grid icon + Quick Access + Jump into your study tools + View All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Quick Access
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Jump into your study tools
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectTab('materials')}
          className="flex items-center gap-1.5 text-xs font-bold text-[#14532D] hover:text-emerald-900 hover:underline transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {tools.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={item.action}
              className={`rounded-2xl p-4 border text-left transition-all duration-200 flex flex-col justify-between group hover:shadow-md hover:-translate-y-0.5 ${item.cardBg}`}
            >
              <div>
                {/* Icon in white card */}
                <div className="w-9 h-9 rounded-xl bg-white border border-white/80 shadow-2xs flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-snug mt-1 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              {/* Bottom round arrow button */}
              <div className="mt-4 pt-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-2xs transition-transform group-hover:translate-x-1 ${item.buttonBg}`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
