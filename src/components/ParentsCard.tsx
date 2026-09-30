import React from 'react';
import { Heart, Sparkles, Award } from 'lucide-react';

export const ParentsCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Subtle warm decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400" />

      <div>
        <div className="flex items-center justify-between mb-3.5 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              For My Parents
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Medical Aspirant
          </span>
        </div>

        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 mb-2 leading-snug tracking-tight">
          “One day, all this hard work will be worth it. Keep going.”
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          Every chapter you master in Biology, Chemistry, Physics, and English brings you one step closer to making them proud on admission day.
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          Study today. Make them proud tomorrow.
        </span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
      </div>
    </div>
  );
};
