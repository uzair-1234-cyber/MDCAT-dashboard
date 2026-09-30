import React, { useState } from 'react';
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
} from 'lucide-react';
import { MCQ, SubjectName, ChapterData, StudyMaterial } from '../types';
import { api } from '../services/api';

interface GenerateMcqsPageProps {
  chapters: ChapterData[];
  materials: StudyMaterial[];
  preselectedSubject?: SubjectName;
  preselectedChapter?: string;
  onSaveMCQsToBank: (mcqs: MCQ[]) => Promise<void>;
  onStartQuizWithMCQs: (mcqs: MCQ[], subject: string, chapter: string) => void;
  onToggleBookmark: (id: string) => Promise<void>;
  onToggleDifficult: (id: string) => Promise<void>;
}

export const GenerateMcqsPage: React.FC<GenerateMcqsPageProps> = ({
  chapters,
  materials,
  preselectedSubject,
  preselectedChapter,
  onSaveMCQsToBank,
  onStartQuizWithMCQs,
  onToggleBookmark,
  onToggleDifficult,
}) => {
  const [subject, setSubject] = useState<SubjectName>(preselectedSubject || 'Biology');
  const [chapter, setChapter] = useState(preselectedChapter || '');
  const [topic, setTopic] = useState('');
  const [sourceMaterialId, setSourceMaterialId] = useState('');
  const [numberOfMCQs, setNumberOfMCQs] = useState(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'MDCAT Level'>('MDCAT Level');
  const [questionType, setQuestionType] = useState<'Conceptual' | 'Factual' | 'Application-based' | 'Mixed'>('Conceptual');

  const [generatedList, setGeneratedList] = useState<MCQ[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const filteredChapters = chapters.filter((c) => c.subject.toLowerCase() === subject.toLowerCase());
  const filteredMaterials = materials.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSavedSuccess(false);

    try {
      const res = await api.generateAiMCQs({
        subject,
        chapter: chapter || (filteredChapters[0]?.title || 'Core Medical Syllabus'),
        topic: topic || 'High Yield Topics',
        sourceMaterialId: sourceMaterialId || undefined,
        numberOfMCQs,
        difficulty,
        questionType,
      });

      setGeneratedList(res.mcqs);
      setRevealedAnswers({});
      setSelectedAnswers({});
    } catch (err: any) {
      setError(err.message || 'Failed to generate MCQs with AI. Please check GEMINI_API_KEY.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (mcqId: string, optKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [mcqId]: optKey }));
    const targetMCQ = generatedList.find((m) => m.id === mcqId);
    if (targetMCQ && optKey !== targetMCQ.correctAnswer) {
      try {
        await api.recordMistake({
          mcqId: targetMCQ.id,
          question: targetMCQ.question,
          subject: targetMCQ.subject || subject,
          chapter: targetMCQ.chapter || chapter,
          topic: targetMCQ.topic || 'AI Drill Question',
          options: targetMCQ.options,
          selectedOption: optKey,
          correctOption: targetMCQ.correctAnswer,
          explanation: targetMCQ.explanation,
        });
      } catch (e) {
        console.error('Failed to record mistake:', e);
      }
    }
  };

  const toggleReveal = (mcqId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [mcqId]: !prev[mcqId] }));
  };

  const handleSaveAll = async () => {
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

  const handleDeleteItem = (id: string) => {
    setGeneratedList((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">AI MCQ Generator</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate high-standard Sindh Board & MDCAT multiple choice questions from curriculum topics or uploaded PDFs.
          </p>
        </div>

        {generatedList.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved to Question Bank!' : saving ? 'Saving...' : 'Save All to Bank'}</span>
            </button>

            <button
              onClick={() => onStartQuizWithMCQs(generatedList, subject, chapter || 'Custom AI Drill')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Take as Live Quiz</span>
            </button>
          </div>
        )}
      </div>

      {/* Generator Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value as SubjectName);
                  setChapter('');
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

            {/* Chapter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">All / General Topics</option>
                {filteredChapters.map((ch) => (
                  <option key={ch.id} value={ch.title}>
                    Ch {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="MDCAT Level">MDCAT Level (High Yield)</option>
                <option value="Hard">Hard (Diagnostic)</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specific Topic (Optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Endomembrane System, VSEPR, Bernoulli"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Source Material Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Extract From Uploaded PDF (Optional)</label>
              <select
                value={sourceMaterialId}
                onChange={(e) => setSourceMaterialId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">General Sindh Textbook Board Syllabus</option>
                {filteredMaterials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    📄 {mat.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Number of MCQs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions (1 - 20)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={numberOfMCQs}
                  onChange={(e) => setNumberOfMCQs(parseInt(e.target.value, 10) || 5)}
                  className="w-24 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-center focus:ring-2 focus:ring-purple-500 outline-none"
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
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing MDCAT Questions...' : `Generate ${numberOfMCQs} MCQs`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated MCQs Display */}
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

          {/* Live Result & Accuracy Breakdown */}
          {(() => {
            const answeredTotal = Object.keys(selectedAnswers).length;
            if (answeredTotal === 0) return null;
            let correctTotal = 0;
            let wrongTotal = 0;
            generatedList.forEach((m) => {
              const sel = selectedAnswers[m.id];
              if (sel) {
                if (sel === m.correctAnswer) correctTotal++;
                else wrongTotal++;
              }
            });
            const pct = Math.round((correctTotal / answeredTotal) * 100);

            return (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-black text-lg text-cyan-300">
                    {pct}%
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Practice Score</h4>
                    <p className="text-xs text-slate-300">
                      Answered: <span className="font-bold text-white">{answeredTotal}/{generatedList.length}</span> • 
                      Correct: <span className="font-bold text-emerald-400">{correctTotal}</span> • 
                      Wrong: <span className="font-bold text-rose-400">{wrongTotal}</span>
                    </p>
                  </div>
                </div>

                {wrongTotal > 0 && (
                  <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>{wrongTotal} wrong question(s) saved to Mistake Book</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="space-y-4">
            {generatedList.map((mcq, idx) => {
              const selectedOpt = selectedAnswers[mcq.id];
              const isRevealed = revealedAnswers[mcq.id];
              const isCorrectSelection = selectedOpt === mcq.correctAnswer;

              return (
                <div
                  key={mcq.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 transition-all"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="h-7 w-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        Q{idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                            {mcq.subject}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {mcq.chapter}
                          </span>
                          {mcq.topic && (
                            <span className="text-[10px] text-slate-400">
                              • {mcq.topic}
                            </span>
                          )}
                          <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-purple-50 text-purple-700">
                            {mcq.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {mcq.question}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleReveal(mcq.id)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isRevealed ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                        title="Toggle Explanation"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isRevealed ? 'Hide' : 'Answer'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteItem(mcq.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const optionText = mcq.options[optKey];
                      const isSelected = selectedOpt === optKey;
                      const isCorrect = mcq.correctAnswer === optKey;

                      let optStyles = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100';

                      if (isSelected) {
                        optStyles = isCorrect
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20';
                      } else if (isRevealed && isCorrect) {
                        optStyles = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleOptionSelect(mcq.id, optKey)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 ${optStyles}`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              : isRevealed && isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {optKey}
                          </span>
                          <span className="flex-1">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Pill if Selected */}
                  {selectedOpt && !isRevealed && (
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className={isCorrectSelection ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {isCorrectSelection ? '✅ Correct! Well done.' : `❌ Incorrect. You chose ${selectedOpt}. Correct is ${mcq.correctAnswer}.`}
                      </span>
                      <button
                        onClick={() => toggleReveal(mcq.id)}
                        className="text-cyan-700 font-semibold hover:underline"
                      >
                        View scientific rationale →
                      </button>
                    </div>
                  )}

                  {/* Revealed Explanation */}
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
  );
};
