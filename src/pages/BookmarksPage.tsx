import React, { useState } from 'react';
import {
  Bookmark,
  AlertTriangle,
  FileText,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MCQ, StudyNote, StudyMaterial, SubjectName } from '../types';

interface BookmarksPageProps {
  mcqs: MCQ[];
  notes: StudyNote[];
  materials: StudyMaterial[];
  onToggleMCQBookmark: (id: string) => Promise<void>;
  onToggleMCQDifficult: (id: string) => Promise<void>;
  onToggleNoteBookmark: (note: StudyNote) => Promise<void>;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  mcqs,
  notes,
  materials,
  onToggleMCQBookmark,
  onToggleMCQDifficult,
  onToggleNoteBookmark,
}) => {
  const [activeCategory, setActiveCategory] = useState<'difficult' | 'mcqs' | 'notes' | 'materials'>('difficult');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [revealedMCQs, setRevealedMCQs] = useState<Record<string, boolean>>({});

  const difficultMCQs = mcqs.filter((m) => m.isDifficult);
  const bookmarkedMCQs = mcqs.filter((m) => m.isBookmarked);
  const bookmarkedNotes = notes.filter((n) => n.bookmarked);
  const bookmarkedMaterials = materials.filter((m) => m.bookmarked);

  const filterBySubject = <T extends { subject: string }>(list: T[]) => {
    if (subjectFilter === 'All') return list;
    return list.filter((i) => i.subject.toLowerCase() === subjectFilter.toLowerCase());
  };

  const currentDifficult = filterBySubject(difficultMCQs);
  const currentMCQs = filterBySubject(bookmarkedMCQs);
  const currentNotes = filterBySubject(bookmarkedNotes);
  const currentMaterials = filterBySubject(bookmarkedMaterials);

  const toggleReveal = (id: string) => {
    setRevealedMCQs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Bookmark className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Bookmarks & Difficult Bank</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revisit tough MCQs, bookmarked textbook notes, and high-yield medical concepts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            {difficultMCQs.length} Difficult Questions
          </span>
        </div>
      </div>

      {/* Category Pills & Subject Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('difficult')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'difficult'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Difficult Questions ({difficultMCQs.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('mcqs')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'mcqs'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Saved MCQs ({bookmarkedMCQs.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('notes')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'notes'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Saved Notes ({bookmarkedNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('materials')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeCategory === 'materials'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Saved Materials ({bookmarkedMaterials.length})</span>
          </button>
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
          {['All', 'Biology', 'Chemistry', 'Physics', 'English'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                subjectFilter === sub
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Content for Difficult / Saved MCQs */}
      {(activeCategory === 'difficult' || activeCategory === 'mcqs') && (
        <div className="space-y-4">
          {(activeCategory === 'difficult' ? currentDifficult : currentMCQs).map((mcq, idx) => {
            const isRevealed = revealedMCQs[mcq.id];

            return (
              <div
                key={mcq.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {mcq.subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{mcq.chapter}</span>
                    <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-rose-50 text-rose-700">
                      {mcq.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleReveal(mcq.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{isRevealed ? 'Hide' : 'Answer'}</span>
                    </button>

                    <button
                      onClick={() => onToggleMCQDifficult(mcq.id)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        mcq.isDifficult
                          ? 'bg-rose-50 text-rose-600 border-rose-300'
                          : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Toggle Difficult Mark"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleMCQBookmark(mcq.id)}
                      className={`p-1.5 rounded-lg border text-xs ${
                        mcq.isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-300'
                          : 'text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Toggle Bookmark"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900">{mcq.question}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as const).map((k) => (
                    <div
                      key={k}
                      className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                        isRevealed && mcq.correctAnswer === k
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold">{k}:</span>
                      <span>{mcq.options[k]}</span>
                    </div>
                  ))}
                </div>

                {isRevealed && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 space-y-1 animate-fadeIn">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer: Option {mcq.correctAnswer}
                    </span>
                    <p className="leading-relaxed">{mcq.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {(activeCategory === 'difficult' ? currentDifficult : currentMCQs).length === 0 && (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No questions found in this category. You can flag difficult questions during quizzes or in the MCQ generator!
            </div>
          )}
        </div>
      )}

      {/* Content for Saved Notes */}
      {activeCategory === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {note.subject}
                  </span>
                  <button
                    onClick={() => onToggleNoteBookmark(note)}
                    className="p-1 text-amber-500 hover:text-slate-400"
                  >
                    <Bookmark className="w-4 h-4 fill-amber-500" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                <p className="text-xs text-slate-500">{note.chapter}</p>
                <p className="text-xs text-slate-700 line-clamp-3 mt-2 whitespace-pre-line bg-slate-50 p-2.5 rounded-xl">
                  {note.content}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                Saved {note.updatedAt}
              </span>
            </div>
          ))}

          {currentNotes.length === 0 && (
            <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No notes bookmarked yet. Click the bookmark icon in the Notes section to pin key notes here!
            </div>
          )}
        </div>
      )}

      {/* Content for Saved Materials */}
      {activeCategory === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 inline-block mb-2">
                  {mat.subject} • {mat.type}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                <p className="text-xs text-slate-500">{mat.chapter}</p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2">{mat.description}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                {mat.fileSize}
              </span>
            </div>
          ))}

          {currentMaterials.length === 0 && (
            <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No study materials bookmarked yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
