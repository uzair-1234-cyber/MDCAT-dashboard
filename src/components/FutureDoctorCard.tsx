import React from 'react';
import { Stethoscope, ShieldCheck } from 'lucide-react';

export const FutureDoctorCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Subtle medical cyan top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500" />

      <div>
        <div className="flex items-center justify-between mb-3.5 pt-0.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Future Doctor
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            White Coat Vision
          </span>
        </div>

        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 mb-2 leading-snug tracking-tight">
          “Same dream. Better version of you every day.”
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          The stethoscope you will one day wear is waiting for the persistence you invest today. Stay focused, stay humble.
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Sindh Pre-Medical Class XI
        </span>
        <span className="text-slate-400 font-medium">Target: 2026</span>
      </div>
    </div>
  );
};
