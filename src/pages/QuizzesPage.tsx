import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Flag,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Bot,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MCQ, QuizAttempt, SubjectName, ChapterData } from '../types';
import { api } from '../services/api';
import { FormattedMarkdown } from '../components/FormattedMarkdown';

interface QuizzesPageProps {
  mcqs: MCQ[];
  chapters: ChapterData[];
  quizAttempts: QuizAttempt[];
  onQuizCompleted: (attempt: QuizAttempt) => void;
  customQuizMCQs?: MCQ[] | null;
  customQuizMeta?: { subject: string; chapter: string } | null;
  onClearCustomQuiz?: () => void;
  onNavigateToMistakes?: () => void;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({
  mcqs,
  chapters,
  quizAttempts,
  onQuizCompleted,
  customQuizMCQs,
  customQuizMeta,
  onClearCustomQuiz,
  onNavigateToMistakes,
}) => {
  // Setup parameters
  const [subject, setSubject] = useState<SubjectName>('Biology');
  const [chapter, setChapter] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('MDCAT Level');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  // Active Quiz State
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result State
  const [activeResult, setActiveResult] = useState<QuizAttempt | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiExplain, setLoadingAiExplain] = useState<string | null>(null);

  // Handle auto-starting if custom MCQs were passed from GenerateMcqsPage
  useEffect(() => {
    if (customQuizMCQs && customQuizMCQs.length > 0) {
      startQuizSession(
        customQuizMCQs,
        (customQuizMeta?.subject as SubjectName) || 'Biology',
        customQuizMeta?.chapter || 'Custom Generated Drill',
        15
      );
      if (onClearCustomQuiz) onClearCustomQuiz();
    }
  }, [customQuizMCQs]);

  // Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isQuizActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((s) => s - 1);
      }, 1000);
    } else if (isQuizActive && secondsRemaining === 0) {
      handleSubmitQuiz(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQuizActive, secondsRemaining]);

  const filteredChapters = chapters.filter((c) => c.subject.toLowerCase() === subject.toLowerCase());

  const startQuizSession = (
    pool: MCQ[],
    subj: SubjectName,
    chap: string,
    timeMins: number
  ) => {
    let selected = [...pool];
    if (selected.length === 0) return;

    // Shuffle pool
    selected = selected.sort(() => 0.5 - Math.random());
    const finalSet = selected.slice(0, Math.min(selected.length, numQuestions));

    setActiveQuestions(finalSet);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    const totalSecs = timeMins * 60;
    setInitialSeconds(totalSecs);
    setSecondsRemaining(totalSecs);
    setIsQuizActive(true);
    setActiveResult(null);
  };

  const [launchError, setLaunchError] = useState('');

  const handleStartFromConfig = () => {
    let pool = mcqs.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
    if (chapter) {
      pool = pool.filter((m) => m.chapter.toLowerCase() === chapter.toLowerCase());
    }
    if (pool.length === 0) {
      pool = mcqs.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
    }
    if (pool.length === 0) {
      setLaunchError(
        `Your question bank currently has 0 MCQs for ${subject}. Go to the "Generate MCQs" tab to create your first set of AI questions, or upload study material!`
      );
      return;
    }
    setLaunchError('');
    startQuizSession(pool, subject, chapter || 'Selected Chapters', timeLimitMinutes);
  };

  const handleSelectOption = (mcqId: string, optionKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [mcqId]: optionKey }));
  };

  const toggleFlag = (mcqId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [mcqId]: !prev[mcqId] }));
  };

  const handleSubmitQuiz = async (autoTimedOut = false) => {
    if (!isQuizActive || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.max(initialSeconds - secondsRemaining, 1);

    // Prepare full answers payload with question text, options, and correct answers
    const answersPayload = activeQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: userAnswers[q.id] || '',
      questionText: q.question,
      options: q.options,
      correctOption: q.correctAnswer,
      explanation: q.explanation,
      subject: q.subject || subject,
      chapter: q.chapter || chapter,
      topic: q.topic || 'High Yield Concept',
    }));

    // Local result computation as immediate guarantee
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    const weakTopicsSet = new Set<string>();

    const clientAnswersSummary = activeQuestions.map((q) => {
      const selected = (userAnswers[q.id] || '').trim().toUpperCase();
      const correct = (q.correctAnswer || 'A').trim().toUpperCase();
      const isCorrect = !!selected && selected === correct;

      if (!selected || selected === 'SKIPPED') {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        if (q.topic) weakTopicsSet.add(q.topic);
      }

      return {
        questionId: q.id,
        questionText: q.question,
        selectedOption: selected || 'Skipped',
        correctOption: correct as 'A' | 'B' | 'C' | 'D',
        isCorrect,
        explanation: q.explanation || 'Detailed syllabus explanation.',
        options: q.options,
      };
    });

    const totalQuestions = activeQuestions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100 * 10) / 10 : 0;

    const fallbackAttempt: QuizAttempt = {
      id: 'attempt_' + Date.now(),
      title: `${subject} ${chapter ? `(${chapter})` : 'Practice Exam'}`,
      subject,
      chapter: chapter || 'General MDCAT Practice',
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      skippedQuestions: skippedCount,
      scorePercentage,
      timeSpentSeconds: timeSpent,
      difficulty,
      date: new Date().toISOString().split('T')[0],
      weakTopics: Array.from(weakTopicsSet),
      answersSummary: clientAnswersSummary,
    };

    try {
      const attempt = await api.submitQuiz({
        title: `${subject} ${chapter ? `(${chapter})` : 'Practice Exam'}`,
        subject,
        chapter: chapter || 'General MDCAT Practice',
        answers: answersPayload,
        timeSpentSeconds: timeSpent,
        difficulty,
      });

      setIsQuizActive(false);
      setActiveResult(attempt);
      onQuizCompleted(attempt);

      if (attempt.scorePercentage >= 70) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Quiz submit network/server error, applying local grading:', err);
      setIsQuizActive(false);
      setActiveResult(fallbackAttempt);
      onQuizCompleted(fallbackAttempt);

      // Record any wrong answers in the background
      for (const q of activeQuestions) {
        const userChoice = (userAnswers[q.id] || '').trim().toUpperCase();
        const correct = (q.correctAnswer || 'A').trim().toUpperCase();
        if (userChoice && userChoice !== correct) {
          api.recordMistake({
            mcqId: q.id,
            question: q.question,
            subject: q.subject || subject,
            chapter: q.chapter || chapter,
            topic: q.topic || 'Core Concept',
            options: q.options,
            selectedOption: userChoice,
            correctOption: correct,
            explanation: q.explanation,
          }).catch(() => {});
        }
      }

      if (fallbackAttempt.scorePercentage >= 70) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskWhyWrong = async (item: any) => {
    const q = activeQuestions.find((m) => m.id === item.questionId);
    if (!q) return;

    try {
      setLoadingAiExplain(item.questionId);
      const res = await api.explainWrongAnswer({
        question: q.question,
        options: q.options,
        selectedOption: item.selectedOption,
        correctOption: item.correctOption,
        subject,
        chapter: q.chapter,
      });
      setAiExplanations((prev) => ({ ...prev, [item.questionId]: res.explanation }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiExplain(null);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // ACTIVE QUIZ RUNNER INTERFACE
  // -------------------------------------------------------------
  if (isQuizActive && activeQuestions.length > 0) {
    const currentQ = activeQuestions[currentIndex];
    const isAnswered = !!userAnswers[currentQ.id];
    const isFlagged = !!flaggedQuestions[currentQ.id];
    const answeredCount = Object.keys(userAnswers).length;
    const progressPct = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-fadeIn pb-12">
        {/* Top Control Bar with Timer & Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Answered: {answeredCount}/{activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => handleSubmitQuiz()}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-600/20 disabled:opacity-60 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Quiz</span>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {currentQ.subject}
                </span>
                <span className="text-xs text-slate-500">{currentQ.chapter}</span>
                {currentQ.topic && (
                  <span className="text-xs text-slate-400">• {currentQ.topic}</span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
                isFlagged
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'text-slate-400 hover:text-slate-700 border-slate-200'
              }`}
              title="Flag Question for Review"
            >
              <Flag className={`w-4 h-4 ${isFlagged ? 'fill-amber-500' : ''}`} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
              const optionText = currentQ.options[optKey];
              const isSelected = userAnswers[currentQ.id] === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(currentQ.id, optKey)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-50/80 border-cyan-500 text-cyan-950 ring-2 ring-cyan-500/20 shadow-xs font-semibold'
                      : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100/80'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {optKey}
                  </span>
                  <span className="flex-1">{optionText}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(idx - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Question Quick Jump Matrix */}
            <div className="hidden md:flex items-center gap-1.5">
              {activeQuestions.map((q, idx) => {
                const answered = !!userAnswers[q.id];
                const flagged = !!flaggedQuestions[q.id];
                const isCurrent = idx === currentIndex;

                let cls = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isCurrent) cls = 'ring-2 ring-cyan-500 bg-cyan-600 text-white border-transparent';
                else if (flagged) cls = 'bg-amber-100 text-amber-800 border-amber-300';
                else if (answered) cls = 'bg-emerald-100 text-emerald-800 border-emerald-300';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${cls}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIndex < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((idx) => Math.min(idx + 1, activeQuestions.length - 1))}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz()}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading & Saving Mistakes...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Test</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // POST-TEST SCORE & REVIEW REPORT
  // -------------------------------------------------------------
  if (activeResult) {
    const isGoodScore = activeResult.scorePercentage >= 70;
    const motivationalQuote = isGoodScore
      ? 'Your consistency is starting to show. You showed up, and that is how doctors are made.'
      : 'No problem. Mistakes show you what to revise next. One chapter closer to your white coat.';

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
        {/* Score Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-[#102038] to-[#122c52] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 mb-3">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Diagnostic Result Report
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
              {activeResult.title}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-200/90 font-medium mb-6">
              “{motivationalQuote}”
            </p>

            {/* Score Ring / Number */}
            <div className="inline-flex flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner mb-6">
              <span className="text-5xl font-extrabold text-white tracking-tight">
                {activeResult.scorePercentage}%
              </span>
              <span className="text-xs text-slate-300 mt-1 font-semibold uppercase tracking-wider">
                {activeResult.correctAnswers} of {activeResult.totalQuestions} Questions Correct
              </span>
            </div>

            {/* 4 Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-left">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Correct</span>
                <span className="font-bold text-emerald-400 text-base">{activeResult.correctAnswers}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Wrong</span>
                <span className="font-bold text-rose-400 text-base">{activeResult.wrongAnswers}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Skipped</span>
                <span className="font-bold text-slate-300 text-base">{activeResult.skippedQuestions}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[11px]">Time Spent</span>
                <span className="font-bold text-cyan-300 text-base">
                  {Math.round(activeResult.timeSpentSeconds / 60)} mins
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveResult(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 shadow-md transition-all"
              >
                Back to Tests Menu
              </button>

              {activeResult.wrongAnswers > 0 && onNavigateToMistakes && (
                <button
                  onClick={() => {
                    setActiveResult(null);
                    onNavigateToMistakes();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Review {activeResult.wrongAnswers} Saved in Mistake Book →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Weak Topics Analysis */}
        {activeResult.weakTopics.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identified Revision Targets
            </h4>
            <p className="text-amber-800">
              You missed questions in the following topics. Schedule a revision session for these:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeResult.weakTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 font-semibold"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Question Review Matrix with "Why was my answer wrong?" AI Explanations */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Detailed Answer Breakdown</h3>

          {activeResult.answersSummary.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const aiExplain = aiExplanations[item.questionId];
            const isExplaining = loadingAiExplain === item.questionId;

            return (
              <div
                key={idx}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-white border-emerald-200/80 shadow-2xs'
                    : 'bg-white border-rose-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {!isCorrect && (
                    <button
                      onClick={() => handleAskWhyWrong(item)}
                      disabled={isExplaining || !!aiExplain}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      <Bot className="w-3.5 h-3.5 text-purple-600" />
                      <span>{isExplaining ? 'Consulting AI...' : aiExplain ? 'AI Explained' : 'Why was my answer wrong?'}</span>
                    </button>
                  )}
                </div>

                <p className="text-sm font-bold text-slate-900 mb-3">{item.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isCorrect ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    <span className="font-semibold block text-[11px] opacity-75">Your Selection:</span>
                    <span className="font-bold">Option {item.selectedOption}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <span className="font-semibold block text-[11px] opacity-75">Correct Answer:</span>
                    <span className="font-bold">Option {item.correctOption}</span>
                  </div>
                </div>

                {/* Standard Rationale */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Syllabus Rationale:</span>
                  <FormattedMarkdown content={item.explanation} fontSize="sm" />
                </div>

                {/* AI In-Depth "Why was my answer wrong?" Box */}
                {aiExplain && (
                  <div className="mt-3 p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800 text-xs">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>AI Diagnostic Breakdown:</span>
                    </div>
                    <FormattedMarkdown content={aiExplain} fontSize="sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // QUIZ SETUP & HISTORY MENU
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <ClipboardCheck className="w-5 h-5 text-cyan-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Quizzes & Test Drills</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate real timed MDCAT entrance tests. Track accuracy, weak topics, and AI explanations for every mistake.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 self-start md:self-auto">
          {quizAttempts.length} Tests Completed
        </span>
      </div>

      {/* Start Quiz Configuration Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Launch New Diagnostic Test</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value as SubjectName);
                setChapter('');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">All Chapters (Full Syllabus Drill)</option>
              {filteredChapters.map((ch) => (
                <option key={ch.id} value={ch.title}>
                  Ch {ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Questions</label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value={5}>5 Questions (Quick Check)</option>
              <option value={10}>10 Questions (Standard Drill)</option>
              <option value={15}>15 Questions (Diagnostic)</option>
              <option value={20}>20 Questions (MDCAT Mock)</option>
            </select>
          </div>

          {/* Timer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit</label>
            <select
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value={5}>5 Minutes (Rapid)</option>
              <option value={10}>10 Minutes (Standard)</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Deep Mock)</option>
            </select>
          </div>
        </div>

        {launchError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{launchError}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartFromConfig}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Timed Quiz</span>
          </button>
        </div>
      </div>

      {/* Quiz Attempt History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Quiz History & Score Tracking</h3>

        <div className="divide-y divide-slate-100">
          {quizAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {attempt.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{attempt.title}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {attempt.date} • {attempt.totalQuestions} Questions • Time: {Math.round(attempt.timeSpentSeconds / 60)}m
                </p>
                {attempt.weakTopics.length > 0 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Weak areas: {attempt.weakTopics.join(', ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`text-lg font-extrabold ${
                      attempt.scorePercentage >= 70 ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {attempt.scorePercentage}%
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {attempt.correctAnswers}/{attempt.totalQuestions} correct
                  </span>
                </div>

                <button
                  onClick={() => setActiveResult(attempt)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="View Breakdown"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {quizAttempts.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No test attempts recorded yet. Start your first timed drill above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
