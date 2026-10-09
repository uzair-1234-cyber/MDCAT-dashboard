import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Bookmark,
  AlertTriangle,
  Play,
  Save,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Eye,
  EyeOff,
  Trash2,
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckSquare,
  X,
  Database,
  Award,
  ChevronRight,
  Flame,
  Check,
} from 'lucide-react';
import { MCQ, SubjectName, ChapterData, StudyMaterial, AcademicYear } from '../types';
import { api } from '../services/api';
import { STANDARD_MDCAT_MCQS } from '../data/standardMcqs';
import { STANDARD_SECOND_YEAR_CHAPTERS } from '../data/standardSecondYearChapters';

interface GenerateMcqsPageProps {
  chapters: ChapterData[];
  materials: StudyMaterial[];
  mcqs?: MCQ[];
  preselectedSubject?: SubjectName;
  preselectedChapter?: string;
  onSaveMCQsToBank: (mcqs: MCQ[]) => Promise<void>;
  onStartQuizWithMCQs: (mcqs: MCQ[], subject: string, chapter: string) => void;
  onToggleBookmark: (id: string) => Promise<void>;
  onToggleDifficult: (id: string) => Promise<void>;
  onAddChapter?: (payload: {
    subject: SubjectName;
    chapterNumber?: number;
    title: string;
    topics?: string[];
    classYear?: AcademicYear;
  }) => Promise<void>;
  onAddBatchChapters?: (
    chaptersList: Array<{
      subject: SubjectName;
      chapterNumber?: number;
      title: string;
      topics?: string[];
      classYear?: AcademicYear;
    }>
  ) => Promise<void>;
  onRecordMistake?: (payload: any) => Promise<void>;
}

export const GenerateMcqsPage: React.FC<GenerateMcqsPageProps> = ({
  chapters,
  materials,
  mcqs = [],
  preselectedSubject,
  preselectedChapter,
  onSaveMCQsToBank,
  onStartQuizWithMCQs,
  onToggleBookmark,
  onToggleDifficult,
  onAddChapter,
  onAddBatchChapters,
  onRecordMistake,
}) => {
  // Main View Switcher: Question Bank & Practice vs AI MCQ Generator
  const [activeView, setActiveView] = useState<'bank' | 'generator'>('bank');

  // Academic Year Filter
  const [academicYear, setAcademicYear] = useState<'All' | '1st Year' | '2nd Year'>('All');
  const [subject, setSubject] = useState<SubjectName>(preselectedSubject || 'Biology');
  const [selectedChapter, setSelectedChapter] = useState(preselectedChapter || '');

  // Practice Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard' | 'MDCAT Level'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unattempted' | 'Bookmarked' | 'Difficult'>('All');

  // Generator form state
  const [genTopic, setGenTopic] = useState('');
  const [sourceMaterialId, setSourceMaterialId] = useState('');
  const [numberOfMCQs, setNumberOfMCQs] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'MDCAT Level'>('MDCAT Level');
  const [questionType, setQuestionType] = useState<'Conceptual' | 'Factual' | 'Application-based' | 'Mixed'>('Conceptual');

  // Local interactive practice answers
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Generated list state
  const [generatedList, setGeneratedList] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  // Add Chapter Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState<SubjectName>(subject);
  const [modalYear, setModalYear] = useState<AcademicYear>(academicYear === '2nd Year' ? '2nd Year' : '1st Year');
  const [modalTitle, setModalTitle] = useState('');
  const [modalNumber, setModalNumber] = useState('');
  const [modalTopics, setModalTopics] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState('');

  // Loading full 2nd Year batch state
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  // Combine user database MCQs with standard curated questions (avoiding duplicate IDs)
  const combinedMCQs = useMemo(() => {
    const map = new Map<string, MCQ>();
    // Add standard high yield questions first
    STANDARD_MDCAT_MCQS.forEach((m) => {
      map.set(m.id, m);
    });
    // Overlay user saved questions
    mcqs.forEach((m) => {
      map.set(m.id, m);
    });
    return Array.from(map.values());
  }, [mcqs]);

  // Dynamically group chapters for the active subject
  const subjectChapters = useMemo(() => {
    return chapters.filter((c) => c.subject.toLowerCase() === subject.toLowerCase());
  }, [chapters, subject]);

  const firstYearChapters = useMemo(() => {
    return subjectChapters.filter((c) => (c.classYear || '1st Year') === '1st Year');
  }, [subjectChapters]);

  const secondYearChapters = useMemo(() => {
    return subjectChapters.filter((c) => c.classYear === '2nd Year');
  }, [subjectChapters]);

  // Filtered chapters for current academic year filter
  const filteredChapters = useMemo(() => {
    if (academicYear === 'All') return subjectChapters;
    return subjectChapters.filter((c) => (c.classYear || '1st Year') === academicYear);
  }, [subjectChapters, academicYear]);

  // Compute question count per chapter
  const chapterMcqCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedMCQs.forEach((m) => {
      if (m.chapter) {
        counts[m.chapter.toLowerCase()] = (counts[m.chapter.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [combinedMCQs]);

  // Filter materials for active subject
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
  }, [materials, subject]);

  // Filter MCQs for Question Bank Practice
  const practiceMCQs = useMemo(() => {
    return combinedMCQs.filter((m) => {
      // Subject filter
      if (m.subject.toLowerCase() !== subject.toLowerCase()) return false;

      // Academic Year filter
      if (academicYear !== 'All') {
        const itemYear = m.classYear || '1st Year';
        if (itemYear !== academicYear) return false;
      }

      // Chapter filter
      if (selectedChapter) {
        if (m.chapter.toLowerCase() !== selectedChapter.toLowerCase()) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'All') {
        if (m.difficulty !== difficultyFilter) return false;
      }

      // Status filter
      if (statusFilter === 'Bookmarked' && !m.isBookmarked) return false;
      if (statusFilter === 'Difficult' && !m.isDifficult) return false;
      if (statusFilter === 'Unattempted' && userAnswers[m.id]) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuestion = m.question.toLowerCase().includes(q);
        const matchesTopic = (m.topic || '').toLowerCase().includes(q);
        const matchesChapter = (m.chapter || '').toLowerCase().includes(q);
        const matchesOptions = Object.values(m.options).some((opt) => opt.toLowerCase().includes(q));
        if (!matchesQuestion && !matchesTopic && !matchesChapter && !matchesOptions) return false;
      }

      return true;
    });
  }, [combinedMCQs, subject, academicYear, selectedChapter, difficultyFilter, statusFilter, searchQuery, userAnswers]);

  // Total MCQs available for 1st Year and 2nd Year
  const firstYearMcqsCount = useMemo(() => {
    return combinedMCQs.filter(
      (m) => m.subject.toLowerCase() === subject.toLowerCase() && (m.classYear || '1st Year') === '1st Year'
    ).length;
  }, [combinedMCQs, subject]);

  const secondYearMcqsCount = useMemo(() => {
    return combinedMCQs.filter(
      (m) => m.subject.toLowerCase() === subject.toLowerCase() && m.classYear === '2nd Year'
    ).length;
  }, [combinedMCQs, subject]);

  // Handle Option selection in Practice mode
  const handleSelectAnswer = async (mcq: MCQ, optKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [mcq.id]: optKey }));

    // Record mistake if incorrect
    if (optKey !== mcq.correctAnswer) {
      const payload = {
        mcqId: mcq.id,
        question: mcq.question,
        subject: mcq.subject || subject,
        chapter: mcq.chapter || selectedChapter || 'MDCAT Core Chapter',
        topic: mcq.topic || 'High Yield Concept',
        options: mcq.options,
        selectedOption: optKey,
        correctOption: mcq.correctAnswer,
        explanation: mcq.explanation,
      };

      if (onRecordMistake) {
        await onRecordMistake(payload);
      } else {
        api.recordMistake(payload).catch((err) => console.error('Failed to record mistake:', err));
      }
    }
  };

  const toggleRevealAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // AI MCQ Generator Handler
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSavedSuccess(false);

    try {
      const selectedChapterObj = chapters.find(
        (c) => c.title.toLowerCase() === (selectedChapter || '').toLowerCase()
      );
      const effectiveYear = academicYear !== 'All' ? academicYear : selectedChapterObj?.classYear || '1st Year';

      const res = await api.generateAiMCQs({
        subject,
        chapter: selectedChapter || filteredChapters[0]?.title || 'Core Medical Syllabus',
        topic: genTopic || 'High Yield Concepts',
        sourceMaterialId: sourceMaterialId || undefined,
        numberOfMCQs,
        difficulty: genDifficulty,
        questionType,
        classYear: effectiveYear,
      });

      // Tag classYear onto each generated MCQ
      const tagged = (res.mcqs || []).map((m: MCQ) => ({
        ...m,
        classYear: effectiveYear,
      }));

      setGeneratedList(tagged);
      setUserAnswers({});
      setRevealedAnswers({});
    } catch (err: any) {
      setError(err.message || 'Failed to generate MCQs with AI. Please check GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllGenerated = async () => {
    if (generatedList.length === 0) return;
    try {
      setSaving(true);
      await onSaveMCQsToBank(generatedList);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save MCQs');
    } finally {
      setSaving(false);
    }
  };

  // Quick Add Chapter Handler
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    try {
      setIsAddingChapter(true);
      const parsedTopics = modalTopics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        subject: modalSubject,
        chapterNumber: modalNumber ? parseInt(modalNumber, 10) : undefined,
        title: modalTitle.trim(),
        topics: parsedTopics.length > 0 ? parsedTopics : ['Core Medical Concept', 'MDCAT High Yield Topic'],
        classYear: modalYear,
      };

      if (onAddChapter) {
        await onAddChapter(payload);
      } else {
        await api.addChapter(payload);
      }

      setAddSuccessMsg(`Chapter "${modalTitle}" successfully added to ${modalYear}!`);
      setSelectedChapter(modalTitle.trim());
      setSubject(modalSubject);
      setAcademicYear(modalYear);

      setTimeout(() => {
        setIsAddModalOpen(false);
        setModalTitle('');
        setModalNumber('');
        setModalTopics('');
        setAddSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add chapter');
    } finally {
      setIsAddingChapter(false);
    }
  };

  // One-click load full standard 2nd Year chapters
  const handleLoadStandardSecondYear = async () => {
    if (!onAddBatchChapters) return;
    try {
      setIsLoadingBatch(true);
      const subjectPredefined = STANDARD_SECOND_YEAR_CHAPTERS.filter(
        (c) => c.subject.toLowerCase() === subject.toLowerCase()
      );
      await onAddBatchChapters(subjectPredefined);
      setAcademicYear('2nd Year');
      setSelectedChapter('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingBatch(false);
    }
  };

  // Quick suggestions for 2nd Year chapters based on modal subject
  const suggestedSecondYearChapters = useMemo(() => {
    return STANDARD_SECOND_YEAR_CHAPTERS.filter(
      (c) => c.subject.toLowerCase() === modalSubject.toLowerCase()
    );
  }, [modalSubject]);

  return (
    <div className="space-y-6 animate-fadeIn pb-14 max-w-6xl mx-auto">
      {/* Top Banner: MCQs Hub Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">MCQs Section</h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Sindh Board & MDCAT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Practice chapter-wise MCQs, filter by 1st Year (XI) & 2nd Year (XII), or generate AI questions. Naye chapters foran yahan sync hote hain!
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & + Add Chapter Button */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveView('bank')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeView === 'bank'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Question Bank ({combinedMCQs.length})</span>
            </button>
            <button
              onClick={() => setActiveView('generator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                activeView === 'generator'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI MCQ Generator</span>
            </button>
          </div>

          <button
            onClick={() => {
              setModalSubject(subject);
              setModalYear(academicYear === '2nd Year' ? '2nd Year' : '1st Year');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Academic Year Switcher Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Select Academic Level:</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                    academicYear === '2nd Year'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : academicYear === '1st Year'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-cyan-100 text-cyan-800 border-cyan-200'
                  }`}
                >
                  {academicYear === 'All' ? 'Full MDCAT (1st + 2nd Year)' : academicYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                1st Year (XI) aur 2nd Year (XII) ke questions & chapters filter karein.
              </p>
            </div>
          </div>

          {/* Buttons: All MDCAT, 1st Year (XI), 2nd Year (XII) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setAcademicYear('All');
                setSelectedChapter('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                academicYear === 'All'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All MDCAT ({subjectChapters.length} Ch)
            </button>
            <button
              type="button"
              onClick={() => {
                setAcademicYear('1st Year');
                setSelectedChapter('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                academicYear === '1st Year'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              1st Year (XI) ({firstYearChapters.length} Ch • {firstYearMcqsCount} MCQs)
            </button>
            <button
              type="button"
              onClick={() => {
                setAcademicYear('2nd Year');
                setSelectedChapter('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                academicYear === '2nd Year'
                  ? 'bg-purple-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              2nd Year (XII) ({secondYearChapters.length} Ch • {secondYearMcqsCount} MCQs)
            </button>
          </div>
        </div>

        {/* 2nd Year Empty / Starter Banner */}
        {academicYear === '2nd Year' && secondYearChapters.length === 0 && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/80 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-950">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Second Year (Class XII) {subject} Portal Active</span>
              </div>
              <p className="text-purple-800 text-xs">
                Aap 2nd Year ke chapters khud "+ Add Chapter" se add kar sakte hain ya pure standard Sindh Board 2nd Year syllabus ko 1-click se load kar sakte hain!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadStandardSecondYear}
                disabled={isLoadingBatch}
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isLoadingBatch ? 'Loading Syllabus...' : `Load All 2nd Year ${subject} Chapters`}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalSubject(subject);
                  setModalYear('2nd Year');
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-white text-purple-900 border border-purple-300 font-bold text-xs hover:bg-purple-100 transition-all"
              >
                + Add Single Chapter
              </button>
            </div>
          </div>
        )}

        {/* Subject Pills & Chapter Filter Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Subjects: Biology, Chemistry, Physics, English */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['Biology', 'Chemistry', 'Physics', 'English'] as SubjectName[]).map((subjName) => {
              const isSelected = subject === subjName;
              return (
                <button
                  key={subjName}
                  type="button"
                  onClick={() => {
                    setSubject(subjName);
                    setSelectedChapter('');
                    setSourceMaterialId('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {subjName}
                </button>
              );
            })}
          </div>

          {/* Chapter Quick Selector Dropdown */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Chapter Filter:</span>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Chapters ({filteredChapters.length} Available)</option>
              {academicYear === 'All' ? (
                <>
                  {firstYearChapters.length > 0 && (
                    <optgroup label="1st Year (Class XI)">
                      {firstYearChapters.map((ch) => (
                        <option key={ch.id} value={ch.title}>
                          Ch {ch.chapterNumber}: {ch.title} ({chapterMcqCounts[ch.title.toLowerCase()] || 0} MCQs)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {secondYearChapters.length > 0 && (
                    <optgroup label="2nd Year (Class XII)">
                      {secondYearChapters.map((ch) => (
                        <option key={ch.id} value={ch.title}>
                          Ch {ch.chapterNumber}: {ch.title} ({chapterMcqCounts[ch.title.toLowerCase()] || 0} MCQs)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : (
                filteredChapters.map((ch) => (
                  <option key={ch.id} value={ch.title}>
                    [{ch.classYear || '1st Year'}] Ch {ch.chapterNumber}: {ch.title} ({chapterMcqCounts[ch.title.toLowerCase()] || 0} MCQs)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: QUESTION BANK & INTERACTIVE PRACTICE */}
      {/* ========================================================= */}
      {activeView === 'bank' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Controls Bar: Search, Difficulty, Status & Launch Quiz */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question, concept or keywords..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Difficulty */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none text-xs"
              >
                <option value="All">All Difficulties</option>
                <option value="MDCAT Level">MDCAT Level</option>
                <option value="Hard">Hard</option>
                <option value="Medium">Medium</option>
                <option value="Easy">Easy</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none text-xs"
              >
                <option value="All">All Questions</option>
                <option value="Unattempted">Unattempted Only</option>
                <option value="Bookmarked">Bookmarked</option>
                <option value="Difficult">Marked Difficult</option>
              </select>

              {/* Launch Quiz with filtered set */}
              {practiceMCQs.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartQuizWithMCQs(
                      practiceMCQs,
                      subject,
                      selectedChapter || `${academicYear !== 'All' ? academicYear : 'MDCAT'} Question Drill`
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Live Quiz ({practiceMCQs.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Summary Pills */}
          <div className="flex items-center justify-between text-xs px-2 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {practiceMCQs.length} Questions Found
              </span>
              <span>•</span>
              <span>Subject: <strong className="text-slate-800">{subject}</strong></span>
              {selectedChapter && (
                <>
                  <span>•</span>
                  <span>Chapter: <strong className="text-emerald-700">{selectedChapter}</strong></span>
                </>
              )}
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                {academicYear}
              </span>
            </div>

            {Object.keys(userAnswers).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUserAnswers({});
                  setRevealedAnswers({});
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Selections</span>
              </button>
            )}
          </div>

          {/* MCQs List Display */}
          {practiceMCQs.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">No MCQs found for this filter</h3>
                <p className="text-xs text-slate-500">
                  {academicYear === '2nd Year' && secondYearChapters.length === 0
                    ? 'Second Year ke chapters abhi load nahi huwe. Upar "Load All 2nd Year Chapters" button click karein ya AI Generator se banayein.'
                    : 'Aap AI Generator tab par ja kar is chapter ke naye MCQs create kar sakte hain, ya filters clear karein.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView('generator')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
                >
                  ✨ Generate MCQs with AI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicYear('All');
                    setSelectedChapter('');
                    setSearchQuery('');
                    setDifficultyFilter('All');
                    setStatusFilter('All');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {practiceMCQs.map((mcq, idx) => {
                const selectedOpt = userAnswers[mcq.id];
                const isRevealed = revealedAnswers[mcq.id];
                const isCorrect = selectedOpt === mcq.correctAnswer;
                const isAnswered = Boolean(selectedOpt);
                const itemYear = mcq.classYear || '1st Year';

                return (
                  <div
                    key={mcq.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="h-7 w-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                              {mcq.subject}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                itemYear === '2nd Year'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {itemYear}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600">
                              {mcq.chapter}
                            </span>
                            {mcq.topic && (
                              <span className="text-[10px] text-slate-400">
                                • {mcq.topic}
                              </span>
                            )}
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {mcq.difficulty || 'MDCAT Level'}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {mcq.question}
                          </h4>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleRevealAnswer(mcq.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isRevealed
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="View scientific rationale"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isRevealed ? 'Hide' : 'Rationale'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleBookmark(mcq.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            mcq.isBookmarked
                              ? 'bg-amber-50 text-amber-600 border-amber-300'
                              : 'text-slate-400 hover:text-slate-700 border-slate-200'
                          }`}
                          title="Bookmark Question"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${mcq.isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optionText = mcq.options[optKey];
                        const isThisSelected = selectedOpt === optKey;
                        const isThisCorrect = mcq.correctAnswer === optKey;

                        let optStyles = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100/90';

                        if (isThisSelected) {
                          optStyles = isThisCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-semibold'
                            : 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20 font-semibold';
                        } else if (isRevealed && isThisCorrect) {
                          optStyles = 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-semibold';
                        }

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => handleSelectAnswer(mcq, optKey)}
                            className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 cursor-pointer ${optStyles}`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                isThisSelected
                                  ? isThisCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : isRevealed && isThisCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="flex-1">{optionText}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Immediate feedback pill */}
                    {isAnswered && !isRevealed && (
                      <div className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {isCorrect
                            ? '✅ Correct Answer! Excellent.'
                            : `❌ Incorrect. You selected Option ${selectedOpt}. Correct is Option ${mcq.correctAnswer}.`}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleRevealAnswer(mcq.id)}
                          className="text-cyan-700 font-semibold hover:underline"
                        >
                          View scientific explanation →
                        </button>
                      </div>
                    )}

                    {/* Revealed Rationale */}
                    {isRevealed && (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-slate-800 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct Answer: Option {mcq.correctAnswer}</span>
                        </div>
                        <p className="leading-relaxed text-slate-700">{mcq.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: AI MCQ GENERATOR */}
      {/* ========================================================= */}
      {activeView === 'generator' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Generator Config Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Synthesize Custom MDCAT Questions</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Target any chapter from 1st Year (XI) or 2nd Year (XII). Jo bhi chapter add hoga wo list me mojood hoga!
                </p>
              </div>

              {generatedList.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveAllGenerated}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savedSuccess ? 'Saved to Bank!' : saving ? 'Saving...' : 'Save All to Bank'}</span>
                  </button>

                  <button
                    onClick={() => onStartQuizWithMCQs(generatedList, subject, selectedChapter || 'Custom AI Drill')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Take as Live Quiz</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value as SubjectName);
                      setSelectedChapter('');
                      setSourceMaterialId('');
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* Chapter Target */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Target Chapter *</label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {filteredChapters.length} {academicYear === 'All' ? 'Chapters' : academicYear}
                    </span>
                  </div>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">All / Core Syllabus Concepts</option>
                    {academicYear === 'All' ? (
                      <>
                        {firstYearChapters.length > 0 && (
                          <optgroup label="1st Year (Class XI)">
                            {firstYearChapters.map((ch) => (
                              <option key={ch.id} value={ch.title}>
                                Ch {ch.chapterNumber}: {ch.title}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {secondYearChapters.length > 0 && (
                          <optgroup label="2nd Year (Class XII)">
                            {secondYearChapters.map((ch) => (
                              <option key={ch.id} value={ch.title}>
                                Ch {ch.chapterNumber}: {ch.title}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    ) : (
                      filteredChapters.map((ch) => (
                        <option key={ch.id} value={ch.title}>
                          [{ch.classYear || '1st Year'}] Ch {ch.chapterNumber}: {ch.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="MDCAT Level">MDCAT Level (High Yield)</option>
                    <option value="Hard">Hard (Diagnostic / Tricky)</option>
                    <option value="Medium">Medium</option>
                    <option value="Easy">Easy (Recall)</option>
                  </select>
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Conceptual">Conceptual & Mechanism</option>
                    <option value="Application-based">Application & Clinical</option>
                    <option value="Factual">Factual / Textbook recall</option>
                    <option value="Mixed">Mixed MDCAT style</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Specific Topic */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specific Topic (Optional)</label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="e.g. Action Potential, VSEPR, Gauss Law"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Source PDF */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Extract From PDF (Optional)</label>
                  <select
                    value={sourceMaterialId}
                    onChange={(e) => setSourceMaterialId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">General Sindh Board Syllabus</option>
                    {filteredMaterials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        📄 {mat.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                {/* Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions (1 - 20)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={numberOfMCQs}
                      onChange={(e) => setNumberOfMCQs(parseInt(e.target.value, 10) || 5)}
                      className="w-20 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-center focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-1">
                      {[5, 10, 15, 20].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNumberOfMCQs(n)}
                          className={`px-2 py-1 text-xs rounded-lg border font-semibold ${
                            numberOfMCQs === n ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Synthesizing MDCAT Questions...' : `Generate ${numberOfMCQs} MCQs`}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Generated Questions View */}
          {generatedList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-slate-900">
                  Generated Questions ({generatedList.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Select an option to test yourself, or click reveal for the rationale
                </span>
              </div>

              <div className="space-y-4">
                {generatedList.map((mcq, idx) => {
                  const selectedOpt = userAnswers[mcq.id];
                  const isRevealed = revealedAnswers[mcq.id];
                  const isCorrect = selectedOpt === mcq.correctAnswer;

                  return (
                    <div
                      key={mcq.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="h-7 w-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            Q{idx + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                                {mcq.subject}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                  (mcq.classYear || academicYear) === '2nd Year'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {mcq.classYear || (academicYear !== 'All' ? academicYear : '1st Year')}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {mcq.chapter}
                              </span>
                              {mcq.topic && (
                                <span className="text-[10px] text-slate-400">• {mcq.topic}</span>
                              )}
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                                {mcq.difficulty}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                              {mcq.question}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleRevealAnswer(mcq.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              isRevealed ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isRevealed ? 'Hide' : 'Answer'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optionText = mcq.options[optKey];
                          const isSelected = selectedOpt === optKey;

                          let optStyles = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100';

                          if (isSelected) {
                            optStyles = isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20';
                          } else if (isRevealed && mcq.correctAnswer === optKey) {
                            optStyles = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                          }

                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => handleSelectAnswer(mcq, optKey)}
                              className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 cursor-pointer ${optStyles}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                  isSelected
                                    ? isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                    : isRevealed && mcq.correctAnswer === optKey
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {optKey}
                              </span>
                              <span className="flex-1">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedOpt && !isRevealed && (
                        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {isCorrect ? '✅ Correct! Well done.' : `❌ Incorrect. You chose ${selectedOpt}. Correct is ${mcq.correctAnswer}.`}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealAnswer(mcq.id)}
                            className="text-cyan-700 font-semibold hover:underline"
                          >
                            View scientific rationale →
                          </button>
                        </div>
                      )}

                      {isRevealed && (
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-slate-800 space-y-1.5 animate-fadeIn">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct Answer: Option {mcq.correctAnswer}</span>
                          </div>
                          <p className="leading-relaxed text-slate-700">{mcq.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD CHAPTER MODAL (FOR 1ST YEAR & 2ND YEAR) */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Plus className="w-5 h-5 text-emerald-600" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Chapter to MCQs Section</h3>
                  <p className="text-xs text-slate-500">
                    Chapter add hone ke baad foran MCQs dropdown aur Question Bank me shamil ho jayega.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{addSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Academic Year Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year *</label>
                  <select
                    value={modalYear}
                    onChange={(e) => setModalYear(e.target.value as AcademicYear)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="1st Year">1st Year (Class XI)</option>
                    <option value="2nd Year">2nd Year (Class XII)</option>
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={modalSubject}
                    onChange={(e) => setModalSubject(e.target.value as SubjectName)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              {/* Quick suggestions if 2nd Year */}
              {modalYear === '2nd Year' && suggestedSecondYearChapters.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Quick Pick 2nd Year Chapter:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {suggestedSecondYearChapters.map((sug) => (
                      <button
                        key={sug.title}
                        type="button"
                        onClick={() => {
                          setModalTitle(sug.title);
                          setModalNumber(sug.chapterNumber.toString());
                          setModalTopics(sug.topics.join(', '));
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          modalTitle === sug.title
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        Ch {sug.chapterNumber}: {sug.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Title & Number */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ch No. (Optional)</label>
                  <input
                    type="number"
                    value={modalNumber}
                    onChange={(e) => setModalNumber(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chapter Title *</label>
                  <input
                    type="text"
                    required
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. Reproduction, Nuclear Physics"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Key Topics (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={modalTopics}
                  onChange={(e) => setModalTopics(e.target.value)}
                  placeholder="e.g. Gametogenesis, Menstrual Cycle, Fertilization"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingChapter || !modalTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAddingChapter ? 'Adding...' : 'Save & Add to MCQs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
