import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Zap,
  Search,
  Filter,
  Trash2,
  Edit3,
  Save,
  BookOpen,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';
import { MistakeItem, MCQ, SubjectName } from '../types';
import { api } from '../services/api';
import { FormattedMarkdown } from '../components/FormattedMarkdown';

interface MistakeBookPageProps {
  mistakes: MistakeItem[];
  onUpdateMistakes: () => void;
  onLaunchMistakeQuiz: (mcqs: MCQ[], quizTitle: string) => void;
}

export const MistakeBookPage: React.FC<MistakeBookPageProps> = ({
  mistakes,
  onUpdateMistakes,
  onLaunchMistakeQuiz,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedReason, setEditedReason] = useState<string>('');
  const [editedTag, setEditedTag] = useState<string>('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quickTestId, setQuickTestId] = useState<string | null>(null);
  const [selectedTestOption, setSelectedTestOption] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'info' | 'error' | 'success'; message: string } | null>(null);

  const subjects: ('All' | SubjectName)[] = ['All', 'Biology', 'Chemistry', 'Physics', 'English'];

  const quickMistakeTags = [
    'Chromosome / Bio Concept',
    'Conceptual Gap',
    'Misread Question',
    'Forgot Formula',
    'Calculation Error',
    'Confused Options',
    'Vocabulary / Rule',
    'Silly Mistake',
  ];

  // Filtering
  const filteredMistakes = mistakes.filter((m) => {
    if (selectedSubject !== 'All' && m.subject !== selectedSubject) return false;
    if (filterStatus === 'unmastered' && m.mastered) return false;
    if (filterStatus === 'mastered' && !m.mastered) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = m.question.toLowerCase().includes(q);
      const matchCh = m.chapter.toLowerCase().includes(q);
      const matchTop = m.topic.toLowerCase().includes(q);
      const matchReason = m.userReason?.toLowerCase().includes(q);
      if (!matchQ && !matchCh && !matchTop && !matchReason) return false;
    }
    return true;
  });

  const unmasteredCount = mistakes.filter((m) => !m.mastered).length;
  const masteredCount = mistakes.filter((m) => m.mastered).length;

  const handleStartEditing = (m: MistakeItem) => {
    setEditingId(m.id);
    setEditedReason(m.userReason || '');
    setEditedTag(m.mistakeTag || 'Conceptual Gap');
  };

  const handleSaveReason = async (id: string) => {
    try {
      await api.updateMistake(id, {
        userReason: editedReason,
        mistakeTag: editedTag,
      });
      setEditingId(null);
      onUpdateMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMastered = async (m: MistakeItem) => {
    try {
      await api.updateMistake(m.id, { mastered: !m.mastered });
      onUpdateMistakes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    try {
      await api.deleteMistake(id);
      setConfirmDeleteId(null);
      setStatusNotice({ type: 'success', message: 'Mistake removed from your Error Bank.' });
      onUpdateMistakes();
      setTimeout(() => setStatusNotice(null), 3500);
    } catch (e: any) {
      setStatusNotice({ type: 'error', message: e.message || 'Failed to remove mistake' });
    }
  };

  const handleTestMeFromMistakes = async (subjectFilter?: string) => {
    try {
      setIsGeneratingQuiz(true);
      setStatusNotice(null);
      let res = await api.generateQuizFromMistakes({
        subject: subjectFilter !== 'All' ? subjectFilter : undefined,
        limit: 10,
        unmasteredOnly: true,
      });

      if (res.mcqs.length === 0) {
        // Fallback: try generating from all mistakes (including mastered)
        res = await api.generateQuizFromMistakes({
          subject: subjectFilter !== 'All' ? subjectFilter : undefined,
          limit: 10,
          unmasteredOnly: false,
        });
      }

      if (res.mcqs.length === 0) {
        setStatusNotice({
          type: 'info',
          message: 'No mistakes found for this subject yet. Take a quiz from Question Bank first!',
        });
        return;
      }

      onLaunchMistakeQuiz(res.mcqs, res.quizTitle);
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        message: err.message || 'Failed to generate mistake drill exam',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuickOptionSelect = async (mistake: MistakeItem, optKey: string) => {
    setSelectedTestOption(optKey);
    const isCorrect = optKey === mistake.correctOption;
    setTestResult(isCorrect);

    if (isCorrect) {
      try {
        await api.updateMistake(mistake.id, { mastered: true });
        setTimeout(() => {
          onUpdateMistakes();
        }, 1200);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">
      {/* Notice Banner */}
      {statusNotice && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between animate-fadeIn ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : statusNotice.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-cyan-50 border-cyan-300 text-cyan-900'
          }`}
        >
          <span>{statusNotice.message}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-xs font-bold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/80">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Mistake Book / Error Bank
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Har wrong MCQ automatically yahan save hota hai. Identify why you made the mistake, add personal notes, and test yourself repeatedly until mastered!
          </p>
        </div>

        {/* Primary Action Button: "Test me from my mistakes" */}
        <button
          type="button"
          onClick={() => handleTestMeFromMistakes(selectedSubject)}
          disabled={isGeneratingQuiz || mistakes.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-md shadow-rose-900/20 transition-all shrink-0 disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 fill-amber-300 text-amber-300 ${isGeneratingQuiz ? 'animate-spin' : ''}`} />
          <span>{isGeneratingQuiz ? 'Generating AI Drill...' : 'Test Me From My Mistakes'}</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Recorded Mistakes</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{mistakes.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all quizzes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-gradient-to-b from-rose-50/30 to-white shadow-2xs">
          <p className="text-xs font-semibold text-rose-700">Need Review (Unmastered)</p>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">{unmasteredCount}</p>
          <p className="text-[11px] text-rose-500 mt-0.5">High exam risk questions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-white shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700">Mastered & Corrected</p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{masteredCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Solved accurately on retake</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">AI Accuracy Rate</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {mistakes.length > 0 ? Math.round((masteredCount / mistakes.length) * 100) : 100}%
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Correction conversion</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Status Segmented Control & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium w-full sm:w-auto justify-between">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({mistakes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unmastered')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'unmastered' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Unresolved ({unmasteredCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('mastered')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'mastered' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search mistakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Mistake Items List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Mistakes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No questions matched your search criteria.'
              : 'You have either cleared all your mistakes or haven’t made mistakes in this filter yet. Great work!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((m) => {
            const isEditing = editingId === m.id;
            const isTesting = quickTestId === m.id;

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                  m.mastered
                    ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Top Row: Meta Tags & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {m.subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {m.chapter} · {m.topic}
                    </span>
                    {m.wrongCount > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Failed {m.wrongCount}x
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMastered(m)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        m.mastered
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{m.mastered ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuickTestId(isTesting ? null : m.id);
                        setSelectedTestOption(null);
                        setTestResult(null);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isTesting ? 'Close Test' : 'Retake MCQ'}</span>
                    </button>

                    {confirmDeleteId === m.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from Mistake Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question */}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-4">
                  {m.question}
                </h4>

                {/* Interactive Retake Mode */}
                {isTesting ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Quick Test Mode: Select the correct answer</span>
                      {testResult !== null && (
                        <span className={testResult ? 'text-emerald-600' : 'text-rose-600'}>
                          {testResult ? '✅ Correct! Mastered updated.' : '❌ Incorrect, review explanation below.'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleQuickOptionSelect(m, opt)}
                          className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all ${
                            selectedTestOption === opt
                              ? opt === m.correctOption
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                                : 'bg-rose-100 border-rose-500 text-rose-900'
                              : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="font-bold mr-1.5">{opt})</span>
                          {m.options[opt]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard Result Comparison */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {/* Wrong Answer */}
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/90 text-xs">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>❌ Your Wrong Answer:</span>
                      </div>
                      <p className="text-rose-950 font-medium pl-5">
                        <span className="font-bold">Option {m.selectedOption}: </span>
                        {m.selectedText || m.options[m.selectedOption as 'A' | 'B' | 'C' | 'D'] || m.selectedOption}
                      </p>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✅ Correct Answer:</span>
                      </div>
                      <p className="text-emerald-950 font-medium pl-5">
                        <span className="font-bold">Option {m.correctOption}: </span>
                        {m.correctText || m.options[m.correctOption]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed mb-4">
                  <span className="font-bold text-slate-900 block mb-1">High-Yield MDCAT Explanation:</span>
                  <FormattedMarkdown content={m.explanation} fontSize="sm" />
                </div>

                {/* Why I Got It Wrong (User Reflection) */}
                <div className="pt-3 border-t border-slate-100">
                  {isEditing ? (
                    <div className="space-y-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">
                          Why did you get this wrong? (Self-Reflection)
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveReason(m.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Note</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      {/* Tag Quick Selector */}
                      <div className="flex flex-wrap gap-1.5">
                        {quickMistakeTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setEditedTag(tag)}
                            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                              editedTag === tag
                                ? 'bg-amber-700 text-white border-amber-700 font-bold'
                                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Note text input */}
                      <input
                        type="text"
                        placeholder="e.g. Chromosome alignment confused during Metaphase vs Anaphase..."
                        value={editedReason}
                        onChange={(e) => setEditedReason(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-700">Why I got it wrong:</span>
                        {m.userReason ? (
                          <span className="text-rose-900 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {m.userReason}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No note added yet</span>
                        )}
                        {m.mistakeTag && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {m.mistakeTag}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStartEditing(m)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{m.userReason ? 'Edit' : 'Add Note'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
