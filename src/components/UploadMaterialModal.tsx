import React, { useState, useMemo } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Image as ImageIcon, Eye, Trash2, GraduationCap } from 'lucide-react';
import { ChapterData, SubjectName, MaterialType, AcademicYear } from '../types';
import { STANDARD_SECOND_YEAR_CHAPTERS } from '../data/standardSecondYearChapters';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterData[];
  onUploadSuccess: (payload: any) => Promise<void>;
}

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  chapters,
  onUploadSuccess,
}) => {
  const [classYear, setClassYear] = useState<AcademicYear>('1st Year');
  const [subject, setSubject] = useState<SubjectName>('Biology');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('PDF');
  const [description, setDescription] = useState('');
  const [contentSnippet, setContentSnippet] = useState('');
  const [tags, setTags] = useState('Sindh Board, MDCAT');
  const [fileName, setFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Merge chapters with standard 2nd year chapters
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

  if (!isOpen) return null;

  const subjectChapters = allChapters.filter(
    (c) => c.subject.toLowerCase() === subject.toLowerCase() && (c.classYear || '1st Year') === classYear
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMb} MB`);

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
      if (isImg) {
        setImagePreview(result);
        setType('Diagram / Image');
      } else {
        setImagePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setFileName('');
    setFileBase64('');
    setFileSize('');
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the study material.');
      return;
    }
    const finalChapter = chapter || subjectChapters[0]?.title || 'General';

    try {
      setIsSubmitting(true);
      setError('');
      await onUploadSuccess({
        title,
        subject,
        chapter: finalChapter,
        topic: topic || 'Key Concepts',
        type,
        description,
        contentSnippet: contentSnippet || description || (imagePreview ? 'Uploaded medical diagram / illustration.' : `Uploaded study document for ${classYear} Medical Preparation.`),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        fileName,
        fileBase64,
        fileSize: fileSize || '1.2 MB',
        classYear,
      });
      clearFile();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload study material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[calc(100dvh-5rem)] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Study Material Repository
          </span>
          <h3 className="text-xl font-bold text-slate-900">Upload PDF / Diagram / Study Material</h3>
          <p className="text-xs text-slate-500">
            Upload images, textbook diagrams, handwritten notes, or PDFs. You can view, zoom, and query them with AI!
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker Box */}
          {!imagePreview ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-cyan-400 rounded-2xl p-5 text-center bg-slate-50/60 hover:bg-cyan-50/30 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,image/*,.png,.jpg,.jpeg,.webp,.gif,.svg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="p-3 bg-white rounded-xl shadow-xs text-cyan-600 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName ? fileName : 'Click or drop Image, PDF, or Document here'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {fileSize ? `File size: ${fileSize}` : 'Supports Images (PNG, JPG, WebP), PDFs, Word & Notes'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-cyan-600 text-white">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-cyan-900">Image Loaded & Ready to View</span>
                  <span className="text-[11px] text-slate-500">({fileSize})</span>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1 font-semibold"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </div>

              {/* Preview image banner */}
              <div className="relative max-h-48 rounded-xl overflow-hidden bg-slate-900/5 flex items-center justify-center border border-slate-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 w-auto object-contain rounded-lg"
                />
              </div>
              <p className="text-[11px] text-cyan-700 mt-2 font-medium">
                ✓ Image recognized. It will be viewable in full resolution with zoom and download options.
              </p>
            </div>
          )}

          {/* Academic Year Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Academic Year / Class Level *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setClassYear('1st Year');
                  setChapter('');
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  classYear === '1st Year'
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
                  setClassYear('2nd Year');
                  setChapter('');
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  classYear === '2nd Year'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>2nd Year (Class XII)</span>
              </button>
            </div>
          </div>

          {/* Subject & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value as SubjectName);
                  setChapter('');
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Material Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaterialType)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="Diagram / Image">Diagram / Medical Image</option>
                <option value="Book">Book / Textbook Excerpt</option>
                <option value="PDF">PDF Document</option>
                <option value="Notes">Notes / Summary</option>
                <option value="MCQs">MCQs Sheet</option>
                <option value="Question Paper">Past Question Paper</option>
                <option value="Other">Other Reference</option>
              </select>
            </div>
          </div>

          {/* Chapter Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="">Select Chapter...</option>
              {subjectChapters.map((ch) => (
                <option key={ch.id} value={ch.title}>
                  [{ch.classYear || '1st Year'}] Ch {ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 1 Cell Structure Summary"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Endomembrane & Organelles"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Content Excerpt / AI Context */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Key Content / Notes Snippet (Used for AI Context & Search)
            </label>
            <textarea
              rows={3}
              value={contentSnippet}
              onChange={(e) => setContentSnippet(e.target.value)}
              placeholder="Paste important formulas, medical points, or excerpt here so the AI can answer questions about it..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="MDCAT, High Yield, Sindh Board, Numericals"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Uploading...' : 'Save & Index Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
