import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  AlertCircle,
  Flag,
  ArrowRight,
  X,
} from 'lucide-react';
import { RevisionPlanItem, SubjectName, ChapterData } from '../types';
import { api } from '../services/api';

interface RevisionPlanPageProps {
  revisionPlans: RevisionPlanItem[];
  chapters: ChapterData[];
  onAddPlan: (item: Partial<RevisionPlanItem>) => Promise<void>;
  onUpdatePlan: (id: string, item: Partial<RevisionPlanItem>) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
}

export const RevisionPlanPage: React.FC<RevisionPlanPageProps> = ({
  revisionPlans,
  chapters,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // New Plan Form State
  const [newSubject, setNewSubject] = useState<SubjectName>('Biology');
  const [newChapter, setNewChapter] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('17:00 - 18:30');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlans = revisionPlans.filter((p) => {
    if (subjectFilter !== 'All' && p.subject.toLowerCase() !== subjectFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onAddPlan({
        subject: newSubject,
        chapter: newChapter || 'High-Yield Chapter',
        topic: newTopic || 'All Topics',
        date: newDate,
        time: newTime,
        priority: newPriority,
        status: 'Not Started',
        notes: newNotes,
      });
      setIsModalOpen(false);
      setNewNotes('');
      setNewTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchAiSuggestions = async () => {
    try {
      setLoadingAi(true);
      const res = await api.getAiRevisionSuggestions();
      setAiSuggestions(res.suggestions || []);
      setAiModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAdoptAiSuggestion = async (sug: any) => {
    try {
      await onAddPlan({
        subject: sug.subject as SubjectName,
        chapter: sug.chapter,
        topic: sug.topic,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '18:00 - 19:30',
        priority: sug.priority as any,
        status: 'Not Started',
        notes: `AI Target Strategy: ${sug.strategyNote}`,
      });
      setAiSuggestions((prev) => prev.filter((s) => s.topic !== sug.topic));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = (plan: RevisionPlanItem) => {
    const nextStatus =
      plan.status === 'Not Started'
        ? 'In Progress'
        : plan.status === 'In Progress'
        ? 'Completed'
        : 'Not Started';
    onUpdatePlan(plan.id, { status: nextStatus });
  };

  const subjectChapters = chapters.filter((c) => c.subject.toLowerCase() === newSubject.toLowerCase());

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
              <CalendarCheck2 className="w-5 h-5 text-rose-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Smart Revision Planner</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build discipline today for doctor tomorrow. Organize daily, weekly, and monthly revision targets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleFetchAiSuggestions}
            disabled={loadingAi}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all disabled:opacity-50 whitespace-nowrap shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{loadingAi ? 'Analyzing Diagnostics...' : 'AI Revision Suggestions'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Top Row: Timeline Switcher & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Timeline:
            </span>
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all text-xs ${
                    viewMode === mode
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {filteredPlans.length} target{filteredPlans.length === 1 ? '' : 's'} scheduled
            </span>
          </div>
        </div>

        {/* Bottom Row: Subject Filter with Smooth Horizontal Scroll & Touch Support */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Subject:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 w-full">
            {['All', 'Biology', 'Chemistry', 'Physics', 'English'].map((sub) => {
              const isSelected = subjectFilter === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredPlans.map((plan) => {
          const isDone = plan.status === 'Completed';

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl border bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone ? 'opacity-70 border-slate-200' : 'border-slate-200/90 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleStatus(plan)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : plan.status === 'In Progress'
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-slate-300 hover:border-cyan-500 bg-white'
                  }`}
                  title="Click to toggle status"
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                  {plan.status === 'In Progress' && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {plan.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        plan.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : plan.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {plan.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400">
                      📅 {plan.date} • 🕒 {plan.time}
                    </span>
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold text-slate-900 ${
                      isDone ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {plan.chapter}: {plan.topic}
                  </h4>

                  {plan.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleStatus(plan)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : plan.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {plan.status}
                </button>

                <button
                  onClick={() => onDeletePlan(plan.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No revision plans scheduled for this view. Create one or request AI Suggestions!
          </div>
        )}
      </div>

      {/* AI Suggestions Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[calc(100dvh-5rem)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">AI Suggested Revision Plan</h3>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                title="Band Karein (Close)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-2.5 flex-shrink-0">
              Generated by analyzing your uncompleted chapters and previous diagnostic mistakes:
            </p>

            <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 scrollbar-thin">
              {aiSuggestions.map((sug, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-purple-800 border border-purple-200">
                        {sug.subject}
                      </span>
                      <span className="text-xs font-bold text-purple-950 truncate">{sug.chapter}</span>
                    </div>
                    <p className="text-xs font-semibold text-purple-900">{sug.topic}</p>
                    <p className="text-[11px] text-purple-700 mt-1">{sug.strategyNote}</p>
                  </div>

                  <button
                    onClick={() => handleAdoptAiSuggestion(sug)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs whitespace-nowrap self-start sm:self-center shadow-xs transition-colors shrink-0"
                  >
                    <span>Add to Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {aiSuggestions.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  All suggestions have been added to your revision plan!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end flex-shrink-0 mt-2">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[calc(100dvh-5rem)] flex flex-col overflow-hidden">
            {/* Sticky Header with Title and Prominent Cut/Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <CalendarCheck2 className="w-4 h-4 text-purple-600" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  Add Revision Target
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Band Karein (Close)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Form Body */}
              <div className="overflow-y-auto pr-1 py-3 space-y-2.5 sm:space-y-3 flex-1 scrollbar-thin">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value as SubjectName);
                      setNewChapter('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
                  <select
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select Chapter...</option>
                    {subjectChapters.map((ch) => (
                      <option key={ch.id} value={ch.title}>
                        Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic *</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Mechanism of Enzyme Action"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 17:00 - 18:30"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Target Goal</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Memorize Lineweaver-Burk equation and practice 15 past questions."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
