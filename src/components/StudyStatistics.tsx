import React from 'react';
import { BookOpen, Layers, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { DatabaseSchema } from '../types';

interface StudyStatisticsProps {
  data: DatabaseSchema;
}

export const StudyStatistics: React.FC<StudyStatisticsProps> = ({ data }) => {
  const totalMaterials = data.materials.length;
  const totalMCQs = data.mcqs.length;
  const quizzesAttempted = data.quizAttempts.length;

  const totalChapters = data.chapters.length;
  const completedChapters = data.chapters.filter((c) => c.completed).length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const stats = [
    {
      label: 'Total Study Material',
      value: totalMaterials.toString(),
      subtext: totalMaterials === 0 ? 'Upload books or notes' : 'Books / PDFs / Notes',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      badge: totalMaterials === 0 ? 'Empty Library' : 'Active Library',
      badgeColor: totalMaterials === 0 ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Total MCQs',
      value: totalMCQs.toString(),
      subtext: totalMCQs === 0 ? 'Generate with AI Tutor' : 'Uploaded + AI Generated',
      icon: Layers,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      badge: totalMCQs === 0 ? '0 in Bank' : 'MDCAT Bank',
      badgeColor: totalMCQs === 0 ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Quizzes Attempted',
      value: quizzesAttempted.toString(),
      subtext: quizzesAttempted === 0 ? 'Ready for Quiz 1' : 'This Month',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      badge: quizzesAttempted === 0 ? '0 Drills' : 'Practice Drills',
      badgeColor: quizzesAttempted === 0 ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Overall Progress',
      value: `${overallProgress}%`,
      subtext: overallProgress === 0 ? 'Ready to begin Chapter 1' : 'Keep Going!',
      icon: TrendingUp,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
      badge: `${completedChapters}/${totalChapters} Chapters`,
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((st) => {
        const Icon = st.icon;
        return (
          <div
            key={st.label}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`p-2.5 rounded-xl border border-transparent ${st.bgColor} ${st.iconColor}`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                {st.badge}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{st.label}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {st.value}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{st.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
