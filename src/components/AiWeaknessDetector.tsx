import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  RotateCcw,
  Zap,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { WeaknessAnalysisResponse, WeakAreaItem } from '../types';
import { api } from '../services/api';

interface AiWeaknessDetectorProps {
  onStartDrill?: (subject?: string) => void;
  onOpenRevision?: (topic: string) => void;
}

export const AiWeaknessDetector: React.FC<AiWeaknessDetectorProps> = ({
  onStartDrill,
  onOpenRevision,
}) => {
  const [data, setData] = useState<WeaknessAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getWeaknessAnalysis();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load weakness analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  if (error || !data || data.topWeakAreas.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                AI Weakness Detector
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                High Priority
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automatic error analysis from your quiz history & Mistake Book
            </p>
          </div>
        </div>

        {onStartDrill && (
          <button
            type="button"
            onClick={() => onStartDrill()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Test Me From Mistakes</span>
          </button>
        )}
      </div>

      {/* AI Speech Prescription Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                AI Diagnostic Speech
              </span>
              <span className="text-[10px] font-medium text-slate-500">· Real-time assessment</span>
            </div>
            <p className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
              {data.aiPrescription}
            </p>
            <p className="text-xs text-slate-600">
              Repeated mistakes in entry test topics cost 1.25 marks per question (including negative marking in MDCAT). Targeted review fixes this in minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Your Top Weak Areas Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Your Top {data.topWeakAreas.length} Weak Areas
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            {data.unmasteredMistakesCount} unresolved mistake questions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.topWeakAreas.map((area: WeakAreaItem, idx: number) => {
            const subjectColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
              Biology: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
              Chemistry: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-500' },
              Physics: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', bar: 'bg-teal-500' },
              English: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-500' },
            };
            const col = subjectColors[area.subject] || subjectColors.Biology;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${col.bg} ${col.text} ${col.border}`}
                    >
                      {area.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        area.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {area.wrongCount} Mistakes
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {area.topicOrChapter}
                  </h5>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {area.aiObservation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {area.recommendedRevisionMins}m recommended
                    </span>
                    <span className="font-semibold text-rose-600">
                      {100 - area.accuracyPercentage}% error rate
                    </span>
                  </div>

                  {onStartDrill && (
                    <button
                      type="button"
                      onClick={() => onStartDrill(area.subject)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <span>Start {area.subject} Drill</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
