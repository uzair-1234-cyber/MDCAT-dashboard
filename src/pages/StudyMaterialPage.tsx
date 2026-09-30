import React, { useState } from 'react';
import {
  Upload,
  Search,
  BookOpen,
  FileText,
  Trash2,
  Bot,
  ExternalLink,
  Eye,
  X,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  AlertTriangle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { StudyMaterial, SubjectName, MaterialType, ChapterData, isMaterialImage } from '../types';

interface StudyMaterialPageProps {
  materials: StudyMaterial[];
  chapters: ChapterData[];
  selectedSubject?: string;
  onOpenUpload: () => void;
  onDeleteMaterial: (id: string) => Promise<void>;
  onAskAboutMaterial: (material: StudyMaterial) => void;
}

export const StudyMaterialPage: React.FC<StudyMaterialPageProps> = ({
  materials,
  chapters,
  selectedSubject,
  onOpenUpload,
  onDeleteMaterial,
  onAskAboutMaterial,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>(selectedSubject || 'All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Preview Modal state
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);
  const [fullscreenImage, setFullscreenImage] = useState<StudyMaterial | null>(null);

  // In-app Delete Confirmation (replaces blocked window.confirm)
  const [deleteTarget, setDeleteTarget] = useState<StudyMaterial | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const filteredMaterials = materials.filter((m) => {
    const matchesSubject = subjectFilter === 'All' || m.subject.toLowerCase() === subjectFilter.toLowerCase();
    const isImg = isMaterialImage(m);
    let matchesType = true;
    if (typeFilter !== 'All') {
      if (typeFilter === 'Diagram / Image') {
        matchesType = isImg;
      } else {
        matchesType = m.type.toLowerCase() === typeFilter.toLowerCase();
      }
    }
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.chapter.toLowerCase().includes(q) ||
      m.topic.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.fileName && m.fileName.toLowerCase().includes(q)) ||
      m.tags.some((t) => t.toLowerCase().includes(q));

    return matchesSubject && matchesType && matchesSearch;
  });

  const handleOpenPreview = (mat: StudyMaterial) => {
    setPreviewMaterial(mat);
    setZoomLevel(1);
    setImageError(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await onDeleteMaterial(deleteTarget.id);
      if (previewMaterial?.id === deleteTarget.id) {
        setPreviewMaterial(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting material:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Study Material & Diagrams</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              {filteredMaterials.length} Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sindh Board textbooks, diagrams, notes, and PDFs organized by subject and chapter.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] min-h-[44px] shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image / PDF</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, chapter, tags, or file name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['All', 'Biology', 'Chemistry', 'Physics', 'English'].map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubjectFilter(sub)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  subjectFilter === sub
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Material Type Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Type:</span>
          {['All', 'Diagram / Image', 'Book', 'PDF', 'Notes', 'MCQs', 'Question Paper'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                typeFilter === type
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map((mat) => {
          const isImg = isMaterialImage(mat);
          const imgSrc = mat.fileBase64 || mat.fileUrl;

          return (
            <div
              key={mat.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Image Preview Banner if uploaded file is an image */}
              {isImg ? (
                <div
                  onClick={() => handleOpenPreview(mat)}
                  className="relative h-44 sm:h-48 w-full bg-slate-50 border-b border-slate-100 cursor-pointer overflow-hidden group/img flex items-center justify-center"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={mat.title}
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover/img:scale-105"
                      onError={(e) => {
                        // Hide broken image and fallback to styled placeholder
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-placeholder');
                          if (fallback) fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}

                  {/* Fallback styled container when image fails or is empty */}
                  <div className={`fallback-placeholder ${imgSrc ? 'hidden' : ''} flex flex-col items-center justify-center p-4 text-center space-y-1`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-1">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{mat.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{mat.fileName || 'Image File'}</span>
                  </div>

                  <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      View Image
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-emerald-300" />
                    Diagram / Image
                  </span>
                </div>
              ) : null}

              <div className="p-5 flex-1 flex flex-col">
                {/* Header Badges */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {mat.subject}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                    {isImg ? (
                      <>
                        <ImageIcon className="w-3 h-3 text-emerald-600" />
                        <span>Diagram</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{mat.type}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Title & Chapter */}
                <h3
                  onClick={() => handleOpenPreview(mat)}
                  className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer"
                >
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Chapter: <span className="text-slate-700 font-semibold">{mat.chapter}</span>
                </p>
                {mat.topic && (
                  <p className="text-xs text-slate-500">
                    Topic: <span className="text-slate-600">{mat.topic}</span>
                  </p>
                )}

                {/* Snippet / Description */}
                <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 font-normal leading-relaxed">
                  {mat.contentSnippet || mat.description || (isImg ? 'Uploaded medical diagram / illustration.' : 'Uploaded First-Year Medical Material.')}
                </p>

                {/* Tags */}
                {mat.tags && mat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {mat.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {mat.fileName || mat.fileSize || '1.2 MB'}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Primary View Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(mat)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs border transition-colors touch-manipulation ${
                      isImg
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200'
                    }`}
                    title={isImg ? 'View Full Image' : 'Read & Preview'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isImg ? 'View Image' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAskAboutMaterial(mat)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold border border-purple-200 transition-colors touch-manipulation"
                    title="Ask AI about this material"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI</span>
                  </button>

                  {/* Guaranteed In-App Delete Button (No window.confirm) */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(mat)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 active:bg-rose-100 transition-colors touch-manipulation"
                    title="Delete Study Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-200 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No study materials match your filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload images, diagrams, textbooks, or notes for Biology, Chemistry, Physics, or English.
          </p>
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Upload Study Material Now
          </button>
        </div>
      )}

      {/* Detail / Read & Image Preview Modal (Fixed, Responsive, Clean) */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {previewMaterial.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {isMaterialImage(previewMaterial) ? 'Diagram / Image' : previewMaterial.type}
                  </span>
                  <span className="text-xs text-slate-400">• {previewMaterial.uploadDate}</span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-slate-900 truncate">{previewMaterial.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Chapter: <span className="font-semibold text-slate-700">{previewMaterial.chapter}</span>
                  {previewMaterial.topic && (
                    <> • Topic: <span className="font-semibold text-slate-700">{previewMaterial.topic}</span></>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewMaterial(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 min-w-0">
              {/* IMAGE VIEWER SECTION */}
              {isMaterialImage(previewMaterial) ? (
                <div className="space-y-2">
                  {/* Image Toolbar (Responsive with wrap, never breaks screen width) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Image Viewer</span>
                      <span className="text-slate-400 font-normal">({Math.round(zoomLevel * 100)}%)</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 3}
                        className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-50 transition-all shadow-2xs"
                        title="Zoom In (+)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.5}
                        className="p-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 disabled:opacity-50 transition-all shadow-2xs"
                        title="Zoom Out (-)"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        className="px-2 py-1 rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold text-[11px] shadow-2xs"
                        title="Reset 100%"
                      >
                        Reset
                      </button>

                      <div className="h-4 w-[1px] bg-slate-300 mx-0.5 hidden sm:block" />

                      {!imageError && (previewMaterial.fileBase64 || previewMaterial.fileUrl) && (
                        <button
                          type="button"
                          onClick={() => setFullscreenImage(previewMaterial)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium shadow-2xs"
                          title="Fullscreen Lightbox"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Fullscreen</span>
                        </button>
                      )}

                      {(previewMaterial.fileBase64 || previewMaterial.fileUrl) && (
                        <a
                          href={previewMaterial.fileBase64 || previewMaterial.fileUrl}
                          download={previewMaterial.fileName || `${previewMaterial.title.replace(/\s+/g, '_')}.png`}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-all shadow-xs"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Image Canvas Container */}
                  <div className="relative w-full min-h-[220px] max-h-[46vh] overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-2 sm:p-4 flex items-center justify-center">
                    {!imageError && (previewMaterial.fileBase64 || previewMaterial.fileUrl) ? (
                      <img
                        src={previewMaterial.fileBase64 || previewMaterial.fileUrl}
                        alt={previewMaterial.title}
                        onError={() => setImageError(true)}
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'center center',
                          transition: 'transform 0.15s ease-out',
                        }}
                        className="max-h-[40vh] max-w-full object-contain rounded-lg shadow-sm cursor-zoom-in"
                        onClick={() => setFullscreenImage(previewMaterial)}
                      />
                    ) : (
                      /* Clean Styled Graphic Fallback if file URL is broken or missing */
                      <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm space-y-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shadow-xs">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{previewMaterial.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {previewMaterial.fileName || 'Image File'} • {previewMaterial.fileSize || 'Standard'}
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                          Image preview is not cached on disk for this entry. You can delete this entry and re-upload with high-resolution image, or review the indexed topic notes below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : previewMaterial.fileUrl ? (
                /* PDF / Document link */
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{previewMaterial.fileName || 'Attached Document'}</h4>
                      <p className="text-xs text-slate-500">{previewMaterial.fileSize || 'PDF Document'}</p>
                    </div>
                  </div>
                  <a
                    href={previewMaterial.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Document</span>
                  </a>
                </div>
              ) : null}

              {/* Notes / Text Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Content Excerpt & Academic Notes
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {previewMaterial.contentSnippet || previewMaterial.description || 'No additional text notes provided.'}
                </div>
              </div>

              {/* Tags */}
              {previewMaterial.tags && previewMaterial.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">Tags:</span>
                  {previewMaterial.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Actions and Direct Delete Option */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(previewMaterial)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Material</span>
              </button>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const m = previewMaterial;
                    setPreviewMaterial(null);
                    onAskAboutMaterial(m);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col p-4 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white p-2 sm:p-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold">{fullscreenImage.title}</h3>
              <p className="text-xs text-slate-400">
                {fullscreenImage.subject} • {fullscreenImage.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(fullscreenImage.fileBase64 || fullscreenImage.fileUrl) && (
                <a
                  href={fullscreenImage.fileBase64 || fullscreenImage.fileUrl}
                  download={fullscreenImage.fileName || 'diagram.png'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setFullscreenImage(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Fullscreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Centered Large Image */}
          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto">
            <img
              src={fullscreenImage.fileBase64 || fullscreenImage.fileUrl}
              alt={fullscreenImage.title}
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Guaranteed In-App Delete Confirmation Modal (Works in all Iframes/Devices) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Study Material?</h3>
                <p className="text-xs text-slate-500">This action will remove the document from your library.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deleteTarget.title}</div>
              <div className="text-slate-500">
                {deleteTarget.subject} • Chapter: {deleteTarget.chapter}
              </div>
              {deleteTarget.fileName && (
                <div className="text-[11px] font-mono text-slate-400">File: {deleteTarget.fileName}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Material'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
