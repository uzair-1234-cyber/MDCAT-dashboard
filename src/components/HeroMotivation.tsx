import React from 'react';
import { Play, BookOpen, ArrowRight } from 'lucide-react';

interface HeroMotivationProps {
  onStartStudying: () => void;
  onOpenMaterials?: () => void;
  onAskAi?: () => void;
  streakDays: number;
  todayMinutes?: number;
  goalMinutes?: number;
  studentName?: string;
  targetExam?: string;
  targetYear?: string;
}

export const HeroMotivation: React.FC<HeroMotivationProps> = ({
  onStartStudying,
  onOpenMaterials,
  onAskAi,
  studentName,
  targetExam,
  targetYear,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EFF7F2] via-[#E8F3EC] to-[#DEECE4] border border-[#D5E8DC] p-6 sm:p-8 lg:p-10 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Badges, Title, Subtitle, Future Doctor cursive, Action Buttons */}
        <div className="flex-1 max-w-2xl space-y-4">
          {/* Top Badges matching reference screenshot */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-[#14532D] bg-[#DCF0E4] border border-[#C2E4CD]">
              {targetExam || 'MDCAT / NUMS'} • {targetYear || '2026'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A]">
              <span>🔥</span> Keep Going!
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome back,{' '}
              <span className="text-[#135A39]">
                {studentName || 'Muhammad Uzair'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl pt-1">
              Every chapter you master in Biology, Chemistry, Physics, and English brings you one step closer to your medical college dream.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartStudying}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0A201B] hover:bg-[#13352D] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-[0.98] min-h-[46px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Study Timer</span>
            </button>

            <button
              type="button"
              onClick={onOpenMaterials || onAskAi}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs hover:shadow transition-all active:scale-[0.98] min-h-[46px]"
            >
              <BookOpen className="w-4 h-4 text-[#135A39]" />
              <span>Study Material</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Handwritten 'Future Doctor' Script + Textbook Desk Photography */}
        <div className="relative shrink-0 flex items-center justify-center lg:justify-end">
          {/* Charming Medical Handwriting Annotation */}
          <div className="absolute -top-4 left-4 lg:-left-12 z-20 pointer-events-none select-none">
            <div className="rotate-[-6deg] flex flex-col items-center">
              <span className="font-serif italic text-lg sm:text-xl font-bold text-[#14532D]/90 tracking-wide drop-shadow-xs">
                Future Doctor
              </span>
              <div className="w-20 h-0.5 bg-[#14532D]/70 rounded-full mt-0.5" />
            </div>
          </div>

          {/* Book Stack & Desk Still Life Photo */}
          <div className="w-64 sm:w-72 lg:w-80 h-44 sm:h-48 lg:h-52 rounded-2xl overflow-hidden shadow-md border border-white/60 bg-white/40">
            <img
              src="../src/assets/images/dashboard_hero_desk_1790761688566.jpg"
              alt="Medical Study Desk"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
