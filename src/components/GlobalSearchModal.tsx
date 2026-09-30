import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Layers, FileText, ChevronRight, Bookmark, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { StudyMaterial, MCQ, StudyNote, ChapterData, isMaterialImage } from '../types';
import { NavTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab, subject?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    materials: StudyMaterial[];
    mcqs: MCQ[];
    notes: StudyNote[];
    chapters: ChapterData[];
  }>({ materials: [], mcqs: [], notes: [], chapters: [] });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ materials: [], mcqs: [], notes: [], chapters: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ materials: [], mcqs: [], notes: [], chapters: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.searchGlobal(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.materials.length + results.mcqs.length + results.notes.length + results.chapters.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, books, MCQs, chapters, medical terms..."
            className="w-full text-sm sm:text-base outline-none text-slate-900 placeholder-slate-400 bg-transparent font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-12 text-center text-sm text-slate-400">
              Searching Sindh Board curriculum and notes...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              No matching materials or MCQs found for "{query}".
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>Type to search across Biology, Chemistry, Physics, and English materials.</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {['Mitochondria', 'Limiting Reactant', 'Bernoulli', 'VSEPR', 'Concordance'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 text-xs rounded-full border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapters */}
          {results.chapters.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Chapters ({results.chapters.length})
              </p>
              <div className="space-y-1">
                {results.chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      onNavigate('progress', ch.subject);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 mr-2">
                        {ch.subject}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        Ch {ch.chapterNumber}: {ch.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Study Materials */}
          {results.materials.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Study Materials & PDFs ({results.materials.length})
              </p>
              <div className="space-y-1">
                {results.materials.map((mat) => {
                  const isImg = isMaterialImage(mat);
                  const imgSrc = mat.fileUrl || mat.fileBase64;

                  return (
                    <button
                      key={mat.id}
                      onClick={() => {
                        onNavigate('materials', mat.subject);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImg && imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={mat.title}
                            className="w-8 h-8 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          />
                        ) : isImg ? (
                          <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {mat.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {mat.subject} • {mat.chapter} • {isImg ? 'Diagram' : mat.type}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MCQs */}
          {results.mcqs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                MCQs ({results.mcqs.length})
              </p>
              <div className="space-y-1">
                {results.mcqs.map((mcq) => (
                  <button
                    key={mcq.id}
                    onClick={() => {
                      onNavigate('mcqs', mcq.subject);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {mcq.question}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {mcq.subject} • {mcq.difficulty} • Correct: Option {mcq.correctAnswer}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Notes ({results.notes.length})
              </p>
              <div className="space-y-1">
                {results.notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onNavigate('notes', note.subject);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {note.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {note.subject} • {note.chapter}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
