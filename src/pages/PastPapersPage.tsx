import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Upload,
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Bookmark,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Plus,
  Play,
  RotateCcw,
  BookOpen,
  Filter,
  X,
  FileCheck,
  Award,
  Trash2,
  GraduationCap,
} from 'lucide-react';
import { ChapterData, SubjectName, PastPaper, ExtractedPastPaperQuestion, GeneratedMockPaper, MCQ, AcademicYear } from '../types';
import { api } from '../services/api';
import { STANDARD_SECOND_YEAR_CHAPTERS } from '../data/standardSecondYearChapters';

interface PastPapersPageProps {
  chapters: ChapterData[];
  onStartQuizWithMCQs?: (mcqs: MCQ[], title: string, subject: string) => void;
  onSaveMCQsToBank?: (mcqs: MCQ[]) => Promise<void>;
  preselectedSubject?: SubjectName;
}

export const PastPapersPage: React.FC<PastPapersPageProps> = ({
  chapters,
  onStartQuizWithMCQs,
  onSaveMCQsToBank,
  preselectedSubject = 'Biology',
}) => {
  // Navigation Modes
  const [activeMode, setActiveMode] = useState<'extract' | 'generator' | 'vault'>('extract');

  // Past Papers Vault State
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);

  // Academic Year State (All | 1st Year | 2nd Year)
  const [academicYear, setAcademicYear] = useState<'All' | '1st Year' | '2nd Year'>('All');

  // Extractor State
  const [extractSubject, setExtractSubject] = useState<SubjectName>(preselectedSubject);
  const [extractChapter, setExtractChapter] = useState<string>('Biological Molecules');
  const [extractTopic, setExtractTopic] = useState<string>('All Chapter Topics');
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [customPaperText, setCustomPaperText] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedPastPaperQuestion[]>([]);
  const [extractionSummary, setExtractionSummary] = useState<string>('');
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedToBank, setSavedToBank] = useState(false);

  // Mock Paper Generator State
  const [genSubject, setGenSubject] = useState<SubjectName | 'Full MDCAT Combo'>('Biology');
  const [selectedChapters, setSelectedChapters] = useState<string[]>(['Biological Molecules', 'Cell Structure and Function']);
  const [genCount, setGenCount] = useState<number>(20);
  const [genDifficulty, setGenDifficulty] = useState<string>('MDCAT Level');
  const [generatingPaper, setGeneratingPaper] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedMockPaper | null>(null);

  // In-Paper Test Mode
  const [paperTestMode, setPaperTestMode] = useState<'review' | 'timed_test' | 'print'>('review');
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1200);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadYear, setUploadYear] = useState('2023');
  const [uploadConductingBody, setUploadConductingBody] = useState('DUHS (Dow University / Sindh)');
  const [uploadSubjects, setUploadSubjects] = useState<SubjectName[]>(['Biology', 'Chemistry', 'Physics', 'English']);
  const [uploadSnippet, setUploadSnippet] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileBase64, setUploadFileBase64] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch Past Papers on mount
  const fetchPapers = async () => {
    try {
      setLoadingPapers(true);
      const res = await api.getPastPapers();
      setPastPapers(res);
      // Default: select all papers for comprehensive scan
      if (res && res.length > 0) {
        setSelectedPaperIds(res.map((p) => p.id));
      }
    } catch (err) {
      console.error('Failed to load past papers:', err);
    } finally {
      setLoadingPapers(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // Update default chapter when subject changes
  useEffect(() => {
    const subjChaps = chapters.filter((c) => c.subject === extractSubject);
    if (subjChaps.length > 0) {
      // If Biology, prefer 'Biological Molecules' if available
      const bioMol = subjChaps.find((c) => c.title.toLowerCase().includes('molecule'));
      setExtractChapter(bioMol ? bioMol.title : subjChaps[0].title);
    }
  }, [extractSubject, chapters]);

  // Timer countdown during timed test
  useEffect(() => {
    if (paperTestMode !== 'timed_test' || testSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paperTestMode, testSubmitted]);

  // Ensure all 2nd Year chapters are present in the list
  const allChapters = React.useMemo(() => {
    const combined = [...chapters];
    STANDARD_SECOND_YEAR_CHAPTERS.forEach((stdCh) => {
      if (
        !combined.some(
          (c) =>
            c.subject.toLowerCase() === stdCh.subject.toLowerCase() &&
            c.title.toLowerCase() === stdCh.title.toLowerCase()
        )
      ) {
        combined.push({
          id: `ch_std_${stdCh.subject.toLowerCase()}_${stdCh.chapterNumber}`,
          subject: stdCh.subject,
          chapterNumber: stdCh.chapterNumber,
          title: stdCh.title,
          topics: stdCh.topics,
          completed: false,
          status: 'not_started',
          notesCount: 0,
          mcqsCount: 0,
          classYear: '2nd Year',
        });
      }
    });
    return combined;
  }, [chapters]);

  // Available chapters for the selected subject filtered by academic year
  const allSubjectChapters = allChapters.filter((c) => c.subject === extractSubject);
  const currentSubjectChapters = allChapters.filter((c) => {
    if (c.subject !== extractSubject) return false;
    if (academicYear !== 'All') return (c.classYear || '1st Year') === academicYear;
    return true;
  });
  const firstYearSubjectChapters = allSubjectChapters.filter((c) => (c.classYear || '1st Year') === '1st Year');
  const secondYearSubjectChapters = allSubjectChapters.filter((c) => c.classYear === '2nd Year');

  // Auto-switch selected chapter when academicYear changes
  useEffect(() => {
    if (academicYear === '2nd Year') {
      const first2ndCh = secondYearSubjectChapters[0];
      if (first2ndCh && !secondYearSubjectChapters.some((c) => c.title === extractChapter)) {
        setExtractChapter(first2ndCh.title);
      }
      const secondChs = secondYearSubjectChapters.slice(0, 2).map((c) => c.title);
      if (secondChs.length > 0 && !selectedChapters.some((t) => secondYearSubjectChapters.some((c) => c.title === t))) {
        setSelectedChapters(secondChs);
      }
    } else if (academicYear === '1st Year') {
      const first1stCh = firstYearSubjectChapters[0];
      if (first1stCh && !firstYearSubjectChapters.some((c) => c.title === extractChapter)) {
        setExtractChapter(first1stCh.title);
      }
    }
  }, [academicYear, extractSubject, secondYearSubjectChapters, firstYearSubjectChapters]);

  // Handle Scan & Extract
  const handleExtractQuestions = async () => {
    try {
      setExtracting(true);
      setUserSelectedAnswers({});
      setRevealedExplanations({});
      setSavedToBank(false);

      const res = await api.extractTopicFromPastPapers({
        subject: extractSubject,
        chapter: extractChapter,
        topic: extractTopic && extractTopic !== 'All Chapter Topics' ? extractTopic : undefined,
        paperIds: selectedPaperIds.length > 0 ? selectedPaperIds : undefined,
        customPaperText: showPasteBox && customPaperText ? customPaperText : undefined,
      });

      setExtractedQuestions(res.questions);
      setExtractionSummary(res.summary);
    } catch (err: any) {
      console.error('Failed to extract questions:', err);
    } finally {
      setExtracting(false);
    }
  };

  // Handle Mock Paper Generation
  const handleGenerateMockPaper = async () => {
    try {
      setGeneratingPaper(true);
      setTestAnswers({});
      setTestSubmitted(false);

      const focusLabel =
        academicYear === '2nd Year'
          ? 'Sindh Board Second-Year (Class XII) Past Paper Weightage'
          : academicYear === '1st Year'
          ? 'Sindh Board First-Year (Class XI) Past Paper Weightage'
          : 'Sindh Board Comprehensive MDCAT (1st & 2nd Year) Past Paper Weightage';

      const paper = await api.generateMockPaper({
        subject: genSubject,
        chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
        numberOfQuestions: genCount,
        difficulty: genDifficulty,
        paperTitle: `MDCAT ${genSubject} (${academicYear}) Official Practice Exam 2026`,
        focusArea: focusLabel,
      });

      if (paper && academicYear !== 'All') {
        paper.classYear = academicYear;
      }

      setGeneratedPaper(paper);
      setTimeLeftSeconds(paper.durationMinutes * 60);
      setPaperTestMode('review');
    } catch (err) {
      console.error('Failed generating paper:', err);
    } finally {
      setGeneratingPaper(false);
    }
  };

  // Handle File Input Selection
  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Auto extract year if found in file name (e.g. 2023, 2022)
    const yearMatch = file.name.match(/\b(201\d|202\d)\b/);
    if (yearMatch) {
      setUploadYear(yearMatch[1]);
    }

    const reader = new FileReader();
    if (
      file.type.includes('text') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv')
    ) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setUploadSnippet(text);
      };
      reader.readAsText(file);
    } else {
      // For PDF or image, read as DataURL Base64
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadFileBase64(base64);
        if (!uploadSnippet.trim()) {
          setUploadSnippet(
            `[Attached Past Paper File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nUploaded content available for AI chapter and topic scanning.`
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Paper Deletion
  const handleDeletePaper = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this uploaded past paper from your vault?')) return;
    try {
      await api.deletePastPaper(id);
      setPastPapers((prev) => prev.filter((p) => p.id !== id));
      setSelectedPaperIds((prev) => prev.filter((pid) => pid !== id));
    } catch (err: any) {
      alert(err.message || 'Could not delete paper');
    }
  };

  const handleSubmitMockExam = async () => {
    setTestSubmitted(true);
    if (!generatedPaper) return;
    for (const q of generatedPaper.questions) {
      const choice = testAnswers[q.id];
      if (choice && choice.toUpperCase() !== q.correctAnswer.toUpperCase()) {
        try {
          await api.recordMistake({
            mcqId: q.id,
            question: q.question,
            subject: q.subject || (genSubject === 'Full MDCAT Combo' ? 'Biology' : genSubject),
            chapter: q.chapter || 'Past Papers Mock Exam',
            topic: 'MDCAT Mock Test',
            options: q.options,
            selectedOption: choice,
            correctOption: q.correctAnswer,
            explanation: q.explanation,
          });
        } catch (e) {}
      }
    }
  };

  // Handle Upload Submission
  const handleUploadPaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a title for the past paper.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      const created = await api.uploadPastPaper({
        title: uploadTitle.trim(),
        year: uploadYear,
        conductingBody: uploadConductingBody,
        subjectsCovered: uploadSubjects,
        fileName: uploadFileName || undefined,
        fileBase64: uploadFileBase64 || undefined,
        rawContentSnippet: uploadSnippet.trim() || undefined,
      });

      setPastPapers((prev) => [created, ...prev]);
      setSelectedPaperIds((prev) => [...prev, created.id]);
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadSnippet('');
      setUploadFileName('');
      setUploadFileBase64('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload past paper.');
    } finally {
      setUploading(false);
    }
  };

  // Copy questions
  const handleCopyQuestions = () => {
    if (extractedQuestions.length === 0) return;
    const formatted = extractedQuestions
      .map(
        (q, i) =>
          `Q${i + 1}. [${q.examAppearance}] ${q.question}\nA) ${q.options.A}\nB) ${q.options.B}\nC) ${q.options.C}\nD) ${q.options.D}\nCorrect: Option ${q.correctAnswer}\nExplanation: ${q.explanation}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Save extracted to Question Bank
  const handleSaveToBank = async () => {
    if (!onSaveMCQsToBank || extractedQuestions.length === 0) return;
    const mcqsToSave: MCQ[] = extractedQuestions.map((q, idx) => ({
      id: 'past_saved_' + Date.now() + '_' + idx,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: 'MDCAT Level',
      questionType: 'Conceptual',
      source: q.examAppearance,
      createdAt: new Date().toISOString().split('T')[0],
    }));

    await onSaveMCQsToBank(mcqsToSave);
    setSavedToBank(true);
    setTimeout(() => setSavedToBank(false), 3000);
  };

  // Launch interactive test with extracted questions
  const handleLaunchExtractedQuiz = () => {
    if (!onStartQuizWithMCQs || extractedQuestions.length === 0) return;
    const mcqs: MCQ[] = extractedQuestions.map((q, idx) => ({
      id: 'quiz_q_' + Date.now() + '_' + idx,
      subject: q.subject,
      chapter: q.chapter,
      topic: q.topic,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: 'MDCAT Level',
      questionType: 'Conceptual',
      source: q.examAppearance,
      createdAt: new Date().toISOString().split('T')[0],
    }));
    onStartQuizWithMCQs(mcqs, `${extractSubject}: ${extractChapter} (Past Papers Drill)`, extractSubject);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <BookOpenCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                MDCAT Intelligence & Past Papers Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Past Paper Scanner & Exam Generator
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Upload past paper files or analyze authentic Sindh Board & MDCAT papers (2020-2023). Extract all real past questions by chapter & topic, or generate full realistic mock test papers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Past Paper</span>
            </button>
            <button
              onClick={() => setActiveMode('generator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Mock Paper</span>
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMode('extract')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeMode === 'extract'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Chapter Question Extractor</span>
          </button>
          <button
            onClick={() => setActiveMode('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeMode === 'generator'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Mock Paper Generator</span>
          </button>
          <button
            onClick={() => setActiveMode('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeMode === 'vault'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-teal-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Past Paper Vault ({pastPapers.length})</span>
          </button>
        </div>
      </div>

      {/* Academic Year Selector Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <GraduationCap className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Academic Year / Syllabus Level:</span>
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
              Filter past paper questions and mock tests for 1st Year (XI) or 2nd Year (XII).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAcademicYear('All')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              academicYear === 'All'
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All MDCAT ({allSubjectChapters.length} Ch)
          </button>
          <button
            type="button"
            onClick={() => setAcademicYear('1st Year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              academicYear === '1st Year'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            1st Year (XI) ({firstYearSubjectChapters.length} Ch)
          </button>
          <button
            type="button"
            onClick={() => setAcademicYear('2nd Year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              academicYear === '2nd Year'
                ? 'bg-purple-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            2nd Year (XII) ({secondYearSubjectChapters.length} Ch)
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: CHAPTER & TOPIC QUESTION EXTRACTOR */}
      {/* ======================================================== */}
      {activeMode === 'extract' && (
        <div className="space-y-6">
          {/* Controls Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Search className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Find & Extract Questions by Chapter
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select your target chapter (1st Year XI or 2nd Year XII) to scan all official MDCAT papers and retrieve real exam questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Example Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                </span>
                <span className="text-xs text-teal-900 font-semibold">
                  <strong className="font-bold">1-Click Test:</strong> First Year Biology Chapter 1 (<em>Biological Molecules</em>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExtractSubject('Biology');
                  const bioMol = chapters.find((c) => c.title.toLowerCase().includes('molecule'));
                  if (bioMol) setExtractChapter(bioMol.title);
                  setExtractTopic('All Chapter Topics');
                }}
                className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all self-start sm:self-auto shrink-0"
              >
                Load Chapter 1 Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Target Subject</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Biology', 'Chemistry', 'Physics', 'English'] as SubjectName[]).map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setExtractSubject(subj)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        extractSubject === subj
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">2. Sindh Board Chapter</label>
                <select
                  value={extractChapter}
                  onChange={(e) => setExtractChapter(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {academicYear === 'All' ? (
                    <>
                      {firstYearSubjectChapters.length > 0 && (
                        <optgroup label="1st Year (Class XI)">
                          {firstYearSubjectChapters.map((ch) => (
                            <option key={ch.id} value={ch.title}>
                              Ch {ch.chapterNumber}: {ch.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {secondYearSubjectChapters.length > 0 && (
                        <optgroup label="2nd Year (Class XII)">
                          {secondYearSubjectChapters.map((ch) => (
                            <option key={ch.id} value={ch.title}>
                              Ch {ch.chapterNumber}: {ch.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  ) : (
                    currentSubjectChapters.map((ch) => (
                      <option key={ch.id} value={ch.title}>
                        [{ch.classYear || '1st Year'}] Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))
                  )}
                </select>
                <span className="block text-[11px] text-teal-700 font-medium mt-1">
                  Selected: {extractChapter} ({allChapters.find(c => c.title === extractChapter)?.classYear || '1st Year'})
                </span>
              </div>

              {/* Topic Focus */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">3. Sub-Topic (Optional)</label>
                <input
                  type="text"
                  value={extractTopic}
                  onChange={(e) => setExtractTopic(e.target.value)}
                  placeholder="e.g. Carbohydrates, Peptide Bond, or All Topics"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                {extractChapter.toLowerCase().includes('molecule') && (
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic Acids', 'Enzymes'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setExtractTopic(tag)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Papers Scope Selection */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>MDCAT Past Papers to Scan ({selectedPaperIds.length} Selected):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasteBox(!showPasteBox)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <span>{showPasteBox ? 'Hide Custom Text' : '+ Paste/Attach Custom Paper'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {pastPapers.map((paper) => {
                  const isSelected = selectedPaperIds.includes(paper.id);
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => {
                        setSelectedPaperIds((prev) =>
                          isSelected ? prev.filter((id) => id !== paper.id) : [...prev, paper.id]
                        );
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-teal-400' : 'bg-slate-400'}`} />
                      <span>{paper.title}</span>
                      <span className="text-[10px] opacity-75">({paper.year})</span>
                    </button>
                  );
                })}
              </div>

              {/* Paste box if open */}
              {showPasteBox && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700">
                    Paste Raw Text from any other MDCAT Past Paper or Exam:
                  </label>
                  <textarea
                    rows={3}
                    value={customPaperText}
                    onChange={(e) => setCustomPaperText(e.target.value)}
                    placeholder="Paste unformatted questions or notes here, AI will parse and match them to your chapter..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Scan Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleExtractQuestions}
                disabled={extracting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-md shadow-teal-600/25 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {extracting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deep Scanning MDCAT Papers for "{extractChapter}"...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Scan & Extract "{extractChapter}" Past Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extracted Questions View */}
          {extractedQuestions.length > 0 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-teal-950">
                      Found {extractedQuestions.length} MDCAT Exam Questions
                    </h3>
                    <p className="text-xs text-teal-800">{extractionSummary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                  <button
                    onClick={handleLaunchExtractedQuiz}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Practice Drill</span>
                  </button>
                  {onSaveMCQsToBank && (
                    <button
                      onClick={handleSaveToBank}
                      disabled={savedToBank}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 font-bold text-xs transition-colors"
                    >
                      {savedToBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{savedToBank ? 'Saved!' : 'Save to Question Bank'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopyQuestions}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Copy all questions to clipboard"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {extractedQuestions.map((q, idx) => {
                  const userChoice = userSelectedAnswers[q.id];
                  const isAnswered = !!userChoice;
                  const isCorrect = userChoice === q.correctAnswer;
                  const showExplanation = revealedExplanations[q.id] || isAnswered;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 transition-all"
                    >
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>{q.examAppearance}</span>
                          </span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                            {q.topic}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          Question #{idx + 1}
                        </span>
                      </div>

                      {/* Question Stem */}
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const optionText = q.options[opt];
                          const isOptionCorrect = q.correctAnswer === opt;
                          const isUserSelected = userChoice === opt;

                          let btnClasses =
                            'p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-start gap-2.5 ';

                          if (isAnswered) {
                            if (isOptionCorrect) {
                              btnClasses += 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                            } else if (isUserSelected && !isCorrect) {
                              btnClasses += 'bg-rose-50 border-rose-300 text-rose-950';
                            } else {
                              btnClasses += 'bg-slate-50/50 border-slate-200 text-slate-500 opacity-60';
                            }
                          } else {
                            btnClasses += 'bg-slate-50 border-slate-200 hover:bg-teal-50 hover:border-teal-300 text-slate-800 cursor-pointer';
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                if (!isAnswered) {
                                  setUserSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                  if (opt.toUpperCase() !== q.correctAnswer.toUpperCase()) {
                                    api.recordMistake({
                                      mcqId: q.id,
                                      question: q.question,
                                      subject: q.subject || extractSubject,
                                      chapter: q.chapter || extractChapter,
                                      topic: q.topic || 'Past Paper Topic',
                                      options: q.options,
                                      selectedOption: opt,
                                      correctOption: q.correctAnswer,
                                      explanation: q.explanation,
                                    }).catch(() => {});
                                  }
                                }
                              }}
                              className={btnClasses}
                            >
                              <span
                                className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isAnswered && isOptionCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isAnswered && isUserSelected
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700'
                                }`}
                              >
                                {opt}
                              </span>
                              <span className="flex-1">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      {showExplanation && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-fadeIn">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct Answer: Option {q.correctAnswer}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
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

      {/* ======================================================== */}
      {/* MODE 2: CUSTOM MOCK PAPER GENERATOR */}
      {/* ======================================================== */}
      {activeMode === 'generator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Generate Custom MDCAT Paper from Past Exam Trends
                  </h2>
                  <p className="text-xs text-slate-500">
                    AI synthesizes a balanced test matching the exact difficulty, weightage, and format of past Sindh Board MDCAT exams.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">1. Subject</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Biology">Biology (MDCAT Standard)</option>
                  <option value="Chemistry">Chemistry (MDCAT Standard)</option>
                  <option value="Physics">Physics (MDCAT Standard)</option>
                  <option value="English">English (MDCAT Standard)</option>
                  <option value="Full MDCAT Combo">Full MDCAT Combo</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">2. Number of Questions</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 15, 25, 40].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGenCount(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        genCount === num
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num} MCQs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">3. Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="MDCAT Level">Official MDCAT Level (Standard)</option>
                  <option value="Challenging / High-Yield">Challenging / Tricky Misconceptions</option>
                  <option value="Foundation & High Yield">High-Yield Formula / Recall</option>
                </select>
              </div>
            </div>

            {/* Chapters Focus */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Included Chapters Focus (Select one or more):
                </label>
                <span className="text-[11px] font-semibold text-purple-700">
                  Filtering by: {academicYear === 'All' ? '1st & 2nd Year Chapters' : academicYear}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {allChapters
                  .filter((c) => {
                    const matchSub = genSubject === 'Full MDCAT Combo' || c.subject === genSubject;
                    if (!matchSub) return false;
                    if (academicYear !== 'All') return (c.classYear || '1st Year') === academicYear;
                    return true;
                  })
                  .map((ch) => {
                    const isChecked = selectedChapters.includes(ch.title);
                    const chYear = ch.classYear || '1st Year';
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setSelectedChapters((prev) =>
                            isChecked ? prev.filter((t) => t !== ch.title) : [...prev, ch.title]
                          );
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold ring-1 ring-purple-400'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            chYear === '2nd Year'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {chYear === '2nd Year' ? 'XII' : 'XI'}
                        </span>
                        <span>{isChecked && '✓ '}{ch.subject}: {ch.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateMockPaper}
                disabled={generatingPaper}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {generatingPaper ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Exam Paper from MDCAT Past Trends...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Complete {genSubject} Exam Paper</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Paper View */}
          {generatedPaper && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6 animate-fadeIn">
              {/* Paper Header / Exam Sheet Banner */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      Sindh Medical Entrance Board
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Official Format</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {generatedPaper.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mt-2">
                    <span>Total Marks: {generatedPaper.totalQuestions}</span>
                    <span>•</span>
                    <span>Duration: {generatedPaper.durationMinutes} Minutes</span>
                    <span>•</span>
                    <span>Subject: {generatedPaper.subject}</span>
                  </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => {
                      setPaperTestMode('timed_test');
                      setTestSubmitted(false);
                      setTimeLeftSeconds(generatedPaper.durationMinutes * 60);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      paperTestMode === 'timed_test'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Timed Test Mode</span>
                  </button>
                  <button
                    onClick={() => setPaperTestMode('review')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      paperTestMode === 'review'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Paper Review</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Print Exam Paper"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Countdown bar in timed mode */}
              {paperTestMode === 'timed_test' && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">
                      Time Remaining: {Math.floor(timeLeftSeconds / 60)}m {timeLeftSeconds % 60}s
                    </span>
                  </div>
                  {!testSubmitted && (
                    <button
                      onClick={handleSubmitMockExam}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              )}

              {/* Exam Result Report Banner */}
              {testSubmitted && (() => {
                const totalQ = generatedPaper.questions.length;
                let correctCount = 0;
                let wrongCount = 0;
                let skippedCount = 0;
                generatedPaper.questions.forEach((q) => {
                  const ans = testAnswers[q.id];
                  if (!ans) skippedCount++;
                  else if (ans.toUpperCase() === q.correctAnswer.toUpperCase()) correctCount++;
                  else wrongCount++;
                });
                const pct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

                return (
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/20 shadow-xl space-y-3 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          Mock Exam Completed
                        </span>
                        <h3 className="text-xl font-extrabold text-white mt-2">
                          Score Report: {pct}%
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          Total: {totalQ} Questions • Correct: <span className="font-bold text-emerald-400">{correctCount}</span> • Wrong: <span className="font-bold text-rose-400">{wrongCount}</span> • Skipped: <span className="text-slate-400">{skippedCount}</span>
                        </p>
                      </div>

                      {wrongCount > 0 && (
                        <div className="text-xs bg-rose-500/20 text-rose-200 border border-rose-400/30 p-3 rounded-2xl max-w-sm">
                          ✅ <span className="font-bold">{wrongCount} missed question(s)</span> have been saved to your <span className="underline font-bold">Mistake Book</span>!
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Questions List */}
              <div className="space-y-6">
                {generatedPaper.questions.map((q, idx) => {
                  const userAns = testAnswers[q.id];
                  const showResult = paperTestMode === 'review' || testSubmitted;

                  return (
                    <div key={q.id} className="pb-5 border-b border-slate-100 last:border-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                          <span className="text-purple-600 font-black mr-2">Q{idx + 1}.</span>
                          {q.question}
                        </p>
                        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                          {q.chapter}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const optText = q.options[opt];
                          const isCorrect = q.correctAnswer === opt;
                          const isChosen = userAns === opt;

                          let optClass =
                            'p-2.5 rounded-xl border text-xs text-left font-medium transition-all flex items-start gap-2 ';

                          if (showResult) {
                            if (isCorrect) {
                              optClass += 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                            } else if (isChosen) {
                              optClass += 'bg-rose-50 border-rose-300 text-rose-950';
                            } else {
                              optClass += 'bg-slate-50 border-slate-200 text-slate-500';
                            }
                          } else {
                            optClass += isChosen
                              ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                              : 'bg-slate-50 border-slate-200 hover:bg-purple-50/50 text-slate-800 cursor-pointer';
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                if (!testSubmitted) {
                                  setTestAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                }
                              }}
                              className={optClass}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                  showResult && isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isChosen
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white border border-slate-300'
                                }`}
                              >
                                {opt}
                              </span>
                              <span>{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {showResult && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-bold text-slate-900 mr-2">Key: ({q.correctAnswer})</span>
                          <span>{q.explanation}</span>
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

      {/* ======================================================== */}
      {/* MODE 3: PAST PAPER VAULT / ARCHIVE */}
      {/* ======================================================== */}
      {activeMode === 'vault' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Past Papers Library</h2>
              <p className="text-xs text-slate-500">
                Official MDCAT test papers archive available for AI analysis and question extraction.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors self-start sm:self-auto shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Paper</span>
            </button>
          </div>

          {pastPapers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                <FileText className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">Your Past Papers Vault is Empty</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No past papers have been uploaded yet. Upload your authentic MDCAT or board past paper files (PDF or text) to scan questions and generate targeted practice drills.
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Your First Past Paper</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {paper.year} Examination
                      </span>
                      <div className="flex items-center gap-1.5">
                        {paper.isCurated ? (
                          <span className="text-[10px] font-bold text-slate-400">Official Archive</span>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              User Uploaded
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeletePaper(paper.id, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete this paper from vault"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Conducting Body: <span className="font-semibold text-slate-700">{paper.conductingBody}</span>
                    </p>

                    <div className="flex gap-1 flex-wrap mt-3">
                      {paper.subjectsCovered.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold text-slate-400">
                      ~{paper.questionsCount} MCQs in archive
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPaperIds([paper.id]);
                        setActiveMode('extract');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
                    >
                      <span>Extract Questions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* UPLOAD PAST PAPER MODAL */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[calc(100dvh-5rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
                  <Upload className="w-4 h-4" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Upload MDCAT Past Paper
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadPaperSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="overflow-y-auto pr-1 py-3 space-y-3 flex-1 scrollbar-thin">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paper Title *</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. MDCAT 2023 Sindh Re-conduct Paper"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exam Year *</label>
                    <input
                      type="text"
                      value={uploadYear}
                      onChange={(e) => setUploadYear(e.target.value)}
                      placeholder="2023"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Conducting Body</label>
                    <input
                      type="text"
                      value={uploadConductingBody}
                      onChange={(e) => setUploadConductingBody(e.target.value)}
                      placeholder="e.g. DUHS / UHS / PMC"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>
                </div>

                {/* File Attachment Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Past Paper File (PDF, TXT, Word, Images)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50/60 hover:bg-teal-50/20 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.json,.md,.csv"
                      onChange={handleFileUploadChange}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors mb-1" />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-teal-800">
                      {uploadFileName ? uploadFileName : 'Click to browse past paper file from device'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Supports PDF, TXT, Word docs, Scanned tests & images
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Past Paper Questions Text / Snippets *
                  </label>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Paste raw text of questions, answer keys, or notes. AI will index them automatically for topic extraction!
                  </p>
                  <textarea
                    rows={6}
                    value={uploadSnippet}
                    onChange={(e) => setUploadSnippet(e.target.value)}
                    placeholder="Paste past paper MCQs text here, e.g.:&#10;Q1. Which bond is formed between monosaccharides...&#10;A) Glycosidic B) Peptide...&#10;Q2. Secondary structure is stabilized by..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {uploading ? 'Adding to Vault...' : 'Save Paper to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
