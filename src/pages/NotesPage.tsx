import React, { useState, useMemo } from 'react';
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
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { StudyNote, SubjectName, ChapterData, AcademicYear } from '../types';
import { STANDARD_SECOND_YEAR_CHAPTERS } from '../data/standardSecondYearChapters';

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
  const [academicYear, setAcademicYear] = useState<'All' | '1st Year' | '2nd Year'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);

  // Form State
  const [noteYear, setNoteYear] = useState<AcademicYear>('1st Year');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectName>('Biology');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('High Yield, Sindh Board');

  // Ensure all 2nd Year chapters are present in the list
  const allChapters = useMemo(() => {
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

  const filteredChapters = allChapters.filter(
    (c) => c.subject.toLowerCase() === subject.toLowerCase() && (c.classYear || '1st Year') === noteYear
  );

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = subjectFilter === 'All' || n.subject.toLowerCase() === subjectFilter.toLowerCase();
    const matchesYear = academicYear === 'All' || (n.classYear || '1st Year') === academicYear;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.chapter.toLowerCase().includes(q) ||
      n.topic.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q);

    return matchesSubject && matchesYear && matchesSearch;
  });

  const firstYearNotesCount = notes.filter((n) => (n.classYear || '1st Year') === '1st Year').length;
  const secondYearNotesCount = notes.filter((n) => n.classYear === '2nd Year').length;

  const handleOpenNew = () => {
    setEditingNote(null);
    setTitle('');
    setNoteYear(academicYear === '2nd Year' ? '2nd Year' : '1st Year');
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
    setNoteYear(n.classYear || '1st Year');
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
          classYear: noteYear,
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
          classYear: noteYear,
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

  const handleLoadSecondYearNotes = async () => {
    const secondYearSamples: Partial<StudyNote>[] = [
      {
        title: 'Homeostasis: Nephron Counter-Current & Kidney Mechanics',
        subject: 'Biology',
        chapter: 'Homeostasis',
        topic: 'Osmoregulation & Nephron Structure',
        content: `### 🩺 High-Yield MDCAT Summary: Homeostasis (Class XII)
1. **Osmoregulation vs Excretion:**
   - Nephron is the structural and functional unit of the human kidney (~1 million per kidney).
   - **Glomerular Ultrafiltration:** Occurs due to high hydrostatic pressure in afferent arteriole (> efferent). Filtration slit diameter ~7-9 nm.
2. **Counter-Current Multiplier:**
   - Descending Loop of Henle: Permeable to water via aquaporins, impermeable to ions. Filtrate becomes hypertonic (up to 1200 mOsm/L at hairpin bend).
   - Ascending Loop of Henle: Impermeable to water. Actively pumps Na+/Cl- into medullary interstitium.
3. **Hormonal Regulation:**
   - **ADH (Vasopressin):** Secreted from posterior pituitary when blood osmolarity rises. Inserts aquaporin-2 into collecting duct cells -> concentrated urine.
   - **Aldosterone:** Released from adrenal cortex via Renin-Angiotensin System (RAAS) to promote Na+ reabsorption and K+ excretion in distal convoluted tubule (DCT).`,
        tags: ['MDCAT High Yield', 'Class XII Biology', 'Sindh Board'],
        bookmarked: true,
        classYear: '2nd Year',
      },
      {
        title: 'Benzene: Resonance, Aromaticity & Electrophilic Substitution',
        subject: 'Chemistry',
        chapter: 'Hydrocarbons',
        topic: 'Aromatic Hydrocarbons & Reactions',
        content: `### 🧪 Class XII Chemistry: Benzene Structure & Mechanisms
1. **Kekulé & Resonance Structure:**
   - Planar regular hexagon, C-C bond length is 1.397 Å (intermediate between single 1.54 Å and double 1.34 Å).
   - Resonance energy = 150.5 kJ/mol (stabilization energy).
2. **Hückel's Rule of Aromaticity:**
   - Ring must be cyclic, planar, fully conjugated, and contain (4n + 2) pi electrons (n=1 for Benzene -> 6 pi electrons).
3. **Key Electrophilic Aromatic Substitutions (EAS):**
   - **Nitration:** Reagent = Conc. HNO3 + Conc. H2SO4 at 50-55°C. Electrophile = Nitronium ion ($NO_2^+$).
   - **Halogenation:** Cl2 with Lewis acid catalyst (FeCl3 or AlCl3). Electrophile = Chloronium ($Cl^+$).
   - **Friedel-Crafts Alkylation:** R-Cl + AlCl3 -> Carbocation intermediate ($R^+$).
   - **Directing Groups:** -OH, -NH2, -CH3 are ortho/para-directing (activating). -NO2, -COOH, -CHO are meta-directing (deactivating).`,
        tags: ['Class XII Chemistry', 'Sindh Board', 'MDCAT High Yield'],
        bookmarked: true,
        classYear: '2nd Year',
      },
      {
        title: 'Electromagnetism: Biot-Savart, Lorentz Force & Faraday’s Induction',
        subject: 'Physics',
        chapter: 'Electromagnetism',
        topic: 'Magnetic Induction & Faraday’s Law',
        content: `### ⚡ Class XII Physics: Core MDCAT Formulas & Concepts
1. **Magnetic Force on Moving Charge:**
   - $\vec{F} = q (\vec{v} \times \vec{B}) \implies F = q v B \sin\theta$.
   - Max force at $\theta = 90^\circ$ (perpendicular velocity). Force is ZERO when charge moves parallel to B ($\theta = 0^\circ$).
   - Magnetic force does NO work on a charged particle because $\vec{F} \perp \vec{v}$ at all instants ($\Delta K = 0$).
2. **Faraday's Law of Induction:**
   - Induced EMF: $\mathcal{E} = -N \frac{\Delta \Phi}{\Delta t}$ where $\Phi = \vec{B} \cdot \vec{A} = BA\cos\theta$.
3. **Lenz's Law:**
   - The direction of induced current is such that it opposes the change that produces it (Law of Conservation of Energy).
4. **Self & Mutual Induction:**
   - $\mathcal{E}_L = -L \frac{\Delta I}{\Delta t}$, Unit of Inductance = Henry (H). Energy stored in inductor: $U = \frac{1}{2} L I^2$.`,
        tags: ['Class XII Physics', 'Sindh Board', 'Formulas'],
        bookmarked: true,
        classYear: '2nd Year',
      },
    ];

    for (const note of secondYearSamples) {
      if (!notes.some((n) => n.title === note.title)) {
        await onAddNote(note);
      }
    }
    setAcademicYear('2nd Year');
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
            Synthesize formulas, high-yield facts, and medical diagrams for 1st Year (XI) & 2nd Year (XII).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleLoadSecondYearNotes}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-semibold text-xs transition-all shadow-2xs whitespace-nowrap"
            title="Pre-load official 2nd Year (XII) revision summaries for Biology, Chemistry, and Physics"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Load 2nd Year High-Yield Notes</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Write Study Note</span>
          </button>
        </div>
      </div>

      {/* Academic Year Switcher Bar */}
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
                {academicYear === 'All' ? 'All MDCAT Notes' : academicYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Filter study notes by 1st Year (XI) or 2nd Year (XII).
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
            All Notes ({notes.length})
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
            1st Year (XI) ({firstYearNotesCount})
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
            2nd Year (XII) ({secondYearNotesCount})
          </button>
        </div>
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
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {note.subject}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                      (note.classYear || '1st Year') === '2nd Year'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {note.classYear || '1st Year'}
                  </span>
                </div>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Year / Class Level *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteYear('1st Year');
                      setChapter('');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      noteYear === '1st Year'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>1st Year (Class XI)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteYear('2nd Year');
                      setChapter('');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      noteYear === '2nd Year'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>2nd Year (Class XII)</span>
                  </button>
                </div>
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
