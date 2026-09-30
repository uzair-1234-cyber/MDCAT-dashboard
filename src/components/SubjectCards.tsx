import React from 'react';
import { Dna, Atom, Compass, BookA, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { SubjectData, ChapterData, MCQ, SubjectName } from '../types';

interface SubjectCardsProps {
  subjects: SubjectData[];
  chapters: ChapterData[];
  mcqs: MCQ[];
  onOpenSubject: (subject: SubjectName) => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
  subjects,
  chapters,
  mcqs,
  onOpenSubject,
}) => {
  const getSubjectMeta = (name: SubjectName) => {
    switch (name) {
      case 'Biology':
        return {
          icon: Dna,
          accentColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          barColor: 'bg-emerald-600',
          hoverBorder: 'hover:border-emerald-300',
          btnHover: 'hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:bg-emerald-700',
          boardTag: 'Sindh XI Botany & Zoology',
        };
      case 'Chemistry':
        return {
          icon: Atom,
          accentColor: 'text-blue-600',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
          badge: 'bg-blue-50 text-blue-800 border-blue-200/80',
          barColor: 'bg-blue-600',
          hoverBorder: 'hover:border-blue-300',
          btnHover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600 active:bg-blue-700',
          boardTag: 'Sindh XI Physical & Inorganic',
        };
      case 'Physics':
        return {
          icon: Compass,
          accentColor: 'text-teal-600',
          iconBg: 'bg-teal-50 text-teal-600 border-teal-200/80',
          badge: 'bg-teal-50 text-teal-800 border-teal-200/80',
          barColor: 'bg-teal-600',
          hoverBorder: 'hover:border-teal-300',
          btnHover: 'hover:bg-teal-600 hover:text-white hover:border-teal-600 active:bg-teal-700',
          boardTag: 'Sindh XI Mechanics & Waves',
        };
      case 'English':
        return {
          icon: BookA,
          accentColor: 'text-purple-600',
          iconBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
          badge: 'bg-purple-50 text-purple-800 border-purple-200/80',
          barColor: 'bg-purple-600',
          hoverBorder: 'hover:border-purple-300',
          btnHover: 'hover:bg-purple-600 hover:text-white hover:border-purple-600 active:bg-purple-700',
          boardTag: 'MDCAT Grammar & Vocab',
        };
      default:
        return {
          icon: BookOpen,
          accentColor: 'text-slate-600',
          iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          barColor: 'bg-slate-600',
          hoverBorder: 'hover:border-slate-300',
          btnHover: 'hover:bg-slate-800 hover:text-white hover:border-slate-800 active:bg-slate-900',
          boardTag: 'Sindh Board XI',
        };
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Sindh Board Medical Subjects</h2>
          <p className="text-xs text-slate-500">
            First-Year Class XI syllabus & MDCAT practice breakdown
          </p>
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
          4 Core Subjects
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {subjects.map((sub) => {
          const meta = getSubjectMeta(sub.name);
          const Icon = meta.icon;

          const subChapters = chapters.filter((c) => c.subject.toLowerCase() === sub.name.toLowerCase());
          const completedChapters = subChapters.filter((c) => c.completed).length;
          const totalChapters = subChapters.length || sub.chaptersCount;
          const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
          const subMcqs = mcqs.filter((m) => m.subject.toLowerCase() === sub.name.toLowerCase());

          return (
            <div
              key={sub.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs ${meta.hoverBorder} hover:shadow-md transition-all flex flex-col justify-between group`}
            >
              <div>
                {/* Header: Icon & Board Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${meta.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border ${meta.badge}`}>
                    {meta.boardTag}
                  </span>
                </div>

                {/* Subject Name & Description */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3.5 leading-relaxed">
                  {sub.description}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 mb-3.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">Chapters</span>
                      <span className="font-bold text-slate-800">
                        {completedChapters}/{totalChapters}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">Questions</span>
                      <span className="font-bold text-slate-800">{subMcqs.length}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Mastery</span>
                    <span className="text-slate-800">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${meta.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button - 44px touch target on mobile */}
              <button
                type="button"
                onClick={() => onOpenSubject(sub.name)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/90 transition-all min-h-[44px] touch-manipulation active:scale-[0.98] ${meta.btnHover}`}
              >
                <span>Study Chapters</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
