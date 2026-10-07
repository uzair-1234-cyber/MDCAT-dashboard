import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Bookmark,
  Trash2,
  Edit3,
  Check,
  Tag,
  BookOpen,
  X,
} from 'lucide-react';
import { StudyNote, SubjectName, ChapterData } from '../types';

interface NotesPageProps {
  notes: StudyNote[];
  chapters: ChapterData[];
  onAddNote: (note: Partial<StudyNote>) => Promise<void>;
  onUpdateNote: (id: string, note: Partial<StudyNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  chapters,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('Biology');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('High Yield, Sindh Board');

  const filteredChapters = chapters.filter((c) => c.subject.toLowerCase() === subject.toLowerCase());

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = subjectFilter === 'All' || n.subject.toLowerCase() === subjectFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.chapter.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q);

    return matchesSubject && matchesSearch;
  });

  const handleOpenNew = () => {
    setEditingNote(null);
    setTitle('');
    setSubject('Biology');
    setChapter('');
    setTopic('');
    setContent('');
    setTags('Sindh Board, Key Points');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (n: StudyNote) => {
    setEditingNote(n);
    setTitle(n.title);
    setSubject(n.subject);
    setChapter(n.chapter);
    setTopic(n.topic);
    setContent(n.content);
    setTags(n.tags.join(', '));
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingNote) {
        await onUpdateNote(editingNote.id, {
          title,
          subject,
          chapter: chapter || 'General',
          topic: topic || 'Key Concepts',
          content,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        });
      } else {
        await onAddNote({
          title,
          subject,
          chapter: chapter || 'General',
          topic: topic || 'Key Concepts',
          content,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          bookmarked: false,
        });
      }
      setIsEditorOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = (n: StudyNote) => {
    onUpdateNote(n.id, { bookmarked: !n.bookmarked });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <FileText className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Medical Study Notes</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Synthesize formulas, high-yield facts, and medical diagrams for your 4 Sindh Board subjects.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write Study Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, concept, formula..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Biology', 'Chemistry', 'Physics', 'English'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubjectFilter(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
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

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {note.subject}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleBookmark(note)}
                    className="p-1 text-slate-400 hover:text-amber-500 rounded-md"
                    title="Bookmark Note"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${note.bookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(note)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete note "${note.title}"?`)) onDeleteNote(note.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                {note.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {note.chapter} {note.topic ? `• ${note.topic}` : ''}
              </p>

              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                {note.content}
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {note.tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Updated: {note.updatedAt}</span>
              <button
                onClick={() => handleOpenEdit(note)}
                className="text-cyan-700 font-bold hover:underline"
              >
                Expand / Edit →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          No notes found for this criteria. Click "Write Study Note" to create one.
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[calc(100dvh-5rem)] overflow-y-auto">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingNote ? 'Edit Study Note' : 'Create Study Note'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fluid Mosaic Model & Membrane Transport"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value as SubjectName);
                      setChapter('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
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
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="">Select Chapter...</option>
                    {filteredChapters.map((ch) => (
                      <option key={ch.id} value={ch.title}>
                        [{ch.classYear || '1st Year'}] Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Plasma membrane phospholipids and cholesterol"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note Content (Supports Headings, Lists, Bold, Markdown)
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write formulas, high-yield definitions, and medical facts..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="MDCAT, High Yield, Sindh Board"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
