import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  BookOpen,
  Layers,
  FileText,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Eye,
  Image as ImageIcon,
  Paperclip,
  X,
  Volume2,
  VolumeX,
  Square,
  Languages,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  MessageSquare,
  Calendar,
  Clock,
  History,
  Search,
  Edit2,
} from 'lucide-react';
import { ChapterData, StudyMaterial, SubjectName, isMaterialImage } from '../types';
import { api } from '../services/api';
import { FormattedMarkdown } from '../components/FormattedMarkdown';

export interface ChatSession {
  id: string;
  title: string;
  subject: SubjectName;
  chapter: string;
  createdAt: string;
  updatedAt: string;
  formattedDate: string;
  formattedTime: string;
  messages: Message[];
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextTag?: string;
  imagePreview?: string;
}

interface AiAssistantPageProps {
  chapters: ChapterData[];
  materials: StudyMaterial[];
  preselectedMaterial?: StudyMaterial | null;
  onSaveAsNote: (title: string, subject: SubjectName, chapter: string, content: string) => Promise<void>;
  onNavigateToMCQGen: (subject: SubjectName, chapter: string) => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  chapters,
  materials,
  preselectedMaterial,
  onSaveAsNote,
  onNavigateToMCQGen,
}) => {
  const [subject, setSubject] = useState<SubjectName>(
    (preselectedMaterial?.subject as SubjectName) || 'Biology'
  );
  const [chapter, setChapter] = useState<string>(preselectedMaterial?.chapter || '');
  const [materialId, setMaterialId] = useState<string>(preselectedMaterial?.id || '');

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'delete' } | null>(null);

  const showToast = (message: string, type: 'success' | 'delete' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 2800);
  };

  // Persistent reference to active speech utterance to prevent garbage collection in Chrome/Safari
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech synthesis if component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    name: string;
    previewUrl: string;
    mimeType: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const questionInputRef = useRef<HTMLInputElement | null>(null);
  const chatScrollTargetRef = useRef<HTMLDivElement | null>(null);

  const formatSessionDate = (d: Date = new Date()): string => {
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatSessionTime = (d: Date = new Date()): string => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDateBadge = (dateStr?: string, fallbackDate?: string): { text: string; isToday: boolean } => {
    try {
      if (!dateStr) return { text: fallbackDate || 'Today', isToday: true };
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { text: fallbackDate || dateStr, isToday: false };
      const now = new Date();
      if (d.toDateString() === now.toDateString()) return { text: 'Today', isToday: true };
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (d.toDateString() === yesterday.toDateString()) return { text: 'Yesterday', isToday: false };
      return {
        text: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        isToday: false,
      };
    } catch {
      return { text: fallbackDate || 'Recent', isToday: false };
    }
  };

  const DEFAULT_WELCOME_MESSAGE: Message = {
    id: 'welcome',
    sender: 'ai',
    text: `## 🎯 Welcome, Future Doctor!
Assalam-o-Alaikum! Main aapka **MediPrep AI Academic Tutor** hoon, jo **First-Year Sindh Textbook Board** aur **MDCAT entry exam** ke liye specifically tayar kiya gaya hai.

### 🔍 Aap mujh se kya pooch sakte hain?
- **Diagrams & MCQs Solve Karna**: Neeche attach button se koi bhi diagram ya question upload karein ya text paste karein.
- **Difficult Mechanisms**: Bioenergetics, Krebs cycle, VSEPR theory, Bernoulli equation, ya English grammar.
- **Aasan Roman Urdu**: Agar English mein samajh na aaye, to 1-click se bilkul aasan Roman Urdu mein explanation le sakte hain!
- **MDCAT High-Yield Points**: Past papers aur test trends ke mutabiq imp formulas aur tricks.

Apna subject aur chapter select karein, ya neeche direct sawal likhein ya diagram attach karein!`,
    timestamp: 'Just now',
  };

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('mediprep_ai_chat_sessions_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Check legacy single history
      const legacyRaw = localStorage.getItem('mediprep_ai_chat_history');
      if (legacyRaw) {
        const legacyMsgs = JSON.parse(legacyRaw);
        if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
          const firstUser = legacyMsgs.find((m: any) => m.sender === 'user');
          const title = firstUser
            ? firstUser.text.replace(/^[#*>\s]+/, '').slice(0, 36) + (firstUser.text.length > 36 ? '...' : '')
            : 'MDCAT Study Session';
          const now = new Date();
          return [
            {
              id: 'sess_' + Date.now(),
              title,
              subject: 'Biology',
              chapter: '',
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
              formattedDate: formatSessionDate(now),
              formattedTime: formatSessionTime(now),
              messages: legacyMsgs,
            },
          ];
        }
      }
    } catch (e) {
      console.error('Error loading AI sessions:', e);
    }
    const now = new Date();
    return [
      {
        id: 'sess_init_' + Date.now(),
        title: 'New Chat',
        subject: 'Biology',
        chapter: '',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        formattedDate: formatSessionDate(now),
        formattedTime: formatSessionTime(now),
        messages: [DEFAULT_WELCOME_MESSAGE],
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'sess_default';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState<string>('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');

  // Fetch sessions from server on mount
  useEffect(() => {
    let isMounted = true;
    api.getAiSessions()
      .then((serverSessions) => {
        if (!isMounted) return;
        if (Array.isArray(serverSessions) && serverSessions.length > 0) {
          setSessions((current) => {
            const map = new Map<string, ChatSession>();
            serverSessions.forEach((s) => map.set(s.id, s));
            current.forEach((s) => {
              if (!map.has(s.id) && s.messages.some((m) => m.sender === 'user')) {
                map.set(s.id, s);
                api.saveAiSession(s).catch(() => {});
              }
            });
            const list = Array.from(map.values()).sort(
              (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
            );
            return list.length > 0 ? list : current;
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mediprep_ai_chat_sessions_v1', JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed saving AI sessions:', e);
    }
  }, [sessions]);

  // Active session and active messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [DEFAULT_WELCOME_MESSAGE];

  const handleSelectSession = (sess: ChatSession) => {
    stopSpeaking();
    setActiveSessionId(sess.id);
    if (sess.subject) setSubject(sess.subject);
    if (sess.chapter !== undefined) setChapter(sess.chapter);
    setError('');
    // Auto-scroll chat area so clicked history conversation opens and displays immediately
    setTimeout(() => {
      chatScrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    // On mobile / tablet screens, close the sidebar so chat opens in full view
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    stopSpeaking();
    setError('');
    setInputQuestion('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // If active session only has the default welcome message and no user question, just focus the input
    const hasUserQuestions = activeSession?.messages?.some((m) => m.sender === 'user');
    if (activeSession && !hasUserQuestions) {
      questionInputRef.current?.focus();
      return;
    }

    const now = new Date();
    const newSession: ChatSession = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: 'New Chat',
      subject,
      chapter,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      formattedDate: formatSessionDate(now),
      formattedTime: formatSessionTime(now),
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender: 'ai',
          text: DEFAULT_WELCOME_MESSAGE.text,
          timestamp: 'Just now',
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    api.saveAiSession(newSession).catch(() => {});
    setTimeout(() => {
      questionInputRef.current?.focus();
    }, 100);
  };

  const handleDeleteSession = (sessId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopSpeaking();
    api.deleteAiSession(sessId).catch(() => {});

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessId);
      try {
        localStorage.removeItem('mediprep_ai_chat_history');
      } catch (_) {}

      if (remaining.length === 0) {
        const now = new Date();
        const fresh: ChatSession = {
          id: 'sess_' + Date.now(),
          title: 'New Chat',
          subject: 'Biology',
          chapter: '',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          formattedDate: formatSessionDate(now),
          formattedTime: formatSessionTime(now),
          messages: [DEFAULT_WELCOME_MESSAGE],
        };
        setActiveSessionId(fresh.id);
        api.saveAiSession(fresh).catch(() => {});
        return [fresh];
      }
      if (activeSessionId === sessId) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
    setSessionToDelete(null);
    showToast('Chat delete ho chuki hai! (Chat deleted)', 'delete');
  };

  const handleDeleteActiveChat = () => {
    if (!activeSession) return;
    handleDeleteSession(activeSession.id);
  };

  const handleClearAllSessions = () => {
    if (!window.confirm('Kya aap saari chat history delete karna chahte hain? (Clear all AI chat history?)')) return;
    stopSpeaking();
    api.clearAllAiSessions().catch(() => {});

    const now = new Date();
    const fresh: ChatSession = {
      id: 'sess_' + Date.now(),
      title: 'New Chat',
      subject: 'Biology',
      chapter: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      formattedDate: formatSessionDate(now),
      formattedTime: formatSessionTime(now),
      messages: [DEFAULT_WELCOME_MESSAGE],
    };
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    api.saveAiSession(fresh).catch(() => {});
    try {
      localStorage.removeItem('mediprep_ai_chat_sessions_v1');
      localStorage.removeItem('mediprep_ai_chat_history');
    } catch (_) {}
    showToast('Tamam chat history delete ho chuki hai! (All history cleared)', 'delete');
  };

  const handleSaveEditTitle = (sessId: string) => {
    const trimmed = editTitleValue.trim();
    if (!trimmed) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === sessId ? { ...s, title: trimmed } : s));
      const target = next.find((s) => s.id === sessId);
      if (target) api.saveAiSession(target).catch(() => {});
      return next;
    });
    setEditingSessionId(null);
  };

  const presetPrompts = [
    'Aasan Roman Urdu mein samjhao (Simple Urdu)',
    'What are the high-yield MDCAT points to memorize?',
    'Explain the step-by-step mechanism of this topic.',
    'Give me 5 difficult conceptual questions with answers.',
    'Create an easy memory trick or mnemonic for this.',
    'Summarize this chapter for quick revision before exam.',
  ];

  const filteredChapters = chapters.filter((c) => c.subject.toLowerCase() === subject.toLowerCase());
  const filteredMaterials = materials.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAttachedImage({
        base64,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuestion).trim();
    const currentImg = attachedImage;
    if ((!q && !currentImg) || loading) return;

    // Stop any ongoing speech when user submits a new prompt
    stopSpeaking();

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: q || 'Please analyze this diagram/question and explain the complete solution step-by-step.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contextTag: `${subject}${chapter ? ` • ${chapter}` : ''}`,
      imagePreview: currentImg?.base64,
    };

    const now = new Date();
    const fDate = formatSessionDate(now);
    const fTime = formatSessionTime(now);

    let sessionAfterUser: ChatSession | null = null;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const shouldUpdateTitle =
          s.title === 'New Consultation' ||
          s.title === 'First Consultation' ||
          s.title === 'New Chat' ||
          s.title === 'MDCAT Study Session';

        const cleanQ = q.replace(/^[#*>\s]+/, '').trim();
        const newTitle = shouldUpdateTitle
          ? (cleanQ.slice(0, 36) + (cleanQ.length > 36 ? '...' : '')) || `${subject} Question`
          : s.title;

        const updated: ChatSession = {
          ...s,
          title: newTitle,
          subject,
          chapter,
          updatedAt: now.toISOString(),
          formattedDate: fDate,
          formattedTime: fTime,
          messages: [...s.messages, userMsg],
        };
        sessionAfterUser = updated;
        return updated;
      })
    );

    if (sessionAfterUser) {
      api.saveAiSession(sessionAfterUser).catch(() => {});
    }

    setInputQuestion('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);
    setError('');

    try {
      const response = await api.askAi({
        question: q || 'Please analyze this diagram/question and explain the complete solution step-by-step.',
        subject,
        chapter,
        materialId: materialId || undefined,
        imageBase64: currentImg?.base64,
        imageMimeType: currentImg?.mimeType,
      });

      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextTag: `${subject} Rationale`,
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const updated: ChatSession = {
            ...s,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, aiMsg],
          };
          api.saveAiSession(updated).catch(() => {});
          return updated;
        })
      );
    } catch (err: any) {
      let msg = err.message || '';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        }
      } catch (_) {}

      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
        setError('Gemini AI par temporary load aya hai. System ne high-stability model trigger kar diya hai. Niche "Dobara Try Karein" button dabayein.');
      } else {
        setError(msg || 'AI response generate karne mein masla hua. Baraye meharbani dobara try karein.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (activeUtteranceRef.current) {
          activeUtteranceRef.current.onend = null;
          activeUtteranceRef.current.onerror = null;
          activeUtteranceRef.current.onstart = null;
        }
        activeUtteranceRef.current = null;
        (window as any).__mediprepActiveUtterance = null;
      } catch (_) {}

      try {
        window.speechSynthesis.pause();
      } catch (_) {}

      try {
        window.speechSynthesis.cancel();
      } catch (_) {}

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      } catch (_) {}

      // Extra tick for mobile Chrome / WebViews
      setTimeout(() => {
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        } catch (_) {}
      }, 30);
    }
    setSpeakingMsgId(null);
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Voice narration is not supported in this browser.');
      return;
    }

    // If currently speaking this message, tap again immediately stops speech!
    if (speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    // Cancel any other previous speech immediately
    stopSpeaking();

    // Clean markdown characters & formatting so voice sounds natural and fluent
    const clean = text
      .replace(/[*#`_>~]/g, ' ')
      .replace(/\$\$.*?\$\$/gs, ' ')
      .replace(/\$.*?\$/g, ' ')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\{([^}]+)\}/g, '$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\rightarrow/g, ' to ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // remove emojis
      .replace(/\b(https?:\/\/\S+)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    activeUtteranceRef.current = utterance;
    (window as any).__mediprepActiveUtterance = utterance;

    // Set speaking state immediately so button updates to red STOP instantly
    setSpeakingMsgId(msgId);

    utterance.onend = () => {
      activeUtteranceRef.current = null;
      (window as any).__mediprepActiveUtterance = null;
      setSpeakingMsgId((curr) => (curr === msgId ? null : curr));
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e);
      }
      activeUtteranceRef.current = null;
      (window as any).__mediprepActiveUtterance = null;
      setSpeakingMsgId((curr) => (curr === msgId ? null : curr));
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSaveNote = async (msg: Message) => {
    try {
      setSavedNoteId(msg.id);
      await onSaveAsNote(
        `${subject} AI Summary: ${chapter || 'High-Yield Notes'}`,
        subject,
        chapter || 'General',
        msg.text
      );
      setTimeout(() => setSavedNoteId(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchHistoryQuery.trim()) return true;
    const q = searchHistoryQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.subject.toLowerCase().includes(q) ||
      (s.chapter && s.chapter.toLowerCase().includes(q)) ||
      s.formattedDate.toLowerCase().includes(q) ||
      s.formattedTime.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <Bot className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Sindh Board & MDCAT AI Academic Tutor
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Instant Question Solver & Study Assistant
            </h1>
            <p className="text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Ask any question, paste text, or upload diagram images. Get crystal-clear explanations in simple English or easy Roman Urdu.
            </p>
          </div>

          {/* Quick Actions: New Chat, History Toggle, and Text Size Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-purple-950/40 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                isSidebarOpen
                  ? 'bg-white text-purple-950 border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-purple-200 border-white/20'
              }`}
              title="Toggle Chat History Sidebar"
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({sessions.length})</span>
            </button>

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  fontSize === 'sm' ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-200 hover:text-white'
                }`}
                title="Small Text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  fontSize === 'base' ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-200 hover:text-white'
                }`}
                title="Standard Text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                  fontSize === 'lg' ? 'bg-white text-purple-950 shadow-xs' : 'text-purple-200 hover:text-white'
                }`}
                title="Large Readable Text"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout: History Sidebar on Left + Chat Area on Right */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ======================================================== */}
        {/* LEFT: CHAT HISTORY SIDEBAR */}
        {/* ======================================================== */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-80 shrink-0 space-y-3 animate-fadeIn">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              {/* New Chat Primary Button */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all hover:scale-[1.01] active:scale-[0.98] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-xl bg-white/20 group-hover:rotate-90 transition-transform">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold tracking-wide">New Chat</div>
                    <div className="text-[10px] text-purple-200 font-normal">Nayi Chat Shuru Karein</div>
                  </div>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Start</span>
              </button>

              {/* Search History Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  placeholder="Search topics / history..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                />
              </div>

              {/* History Section Header */}
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-purple-600" />
                  <span>Chat History</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-slate-100">
                  {filteredSessions.length} {filteredSessions.length === 1 ? 'chat' : 'chats'}
                </span>
              </div>

              {/* Sessions List */}
              <div className="max-h-[520px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {filteredSessions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-7 h-7 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">Koi Chat History Nahi Mili</p>
                    <p className="text-[11px] text-slate-400">Upar "New Chat" par click karein aur sawal poochein!</p>
                    <button
                      onClick={handleNewChat}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 border border-purple-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Chat</span>
                    </button>
                  </div>
                ) : (
                  filteredSessions.map((sess) => {
                    const isActive = activeSessionId === sess.id;
                    const isDeleting = sessionToDelete === sess.id;
                    const userQCount = sess.messages.filter((m) => m.sender === 'user').length;
                    const dateBadge = getDateBadge(sess.updatedAt || sess.createdAt, sess.formattedDate);

                    return (
                      <div
                        key={sess.id}
                        onClick={() => handleSelectSession(sess)}
                        className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isActive
                            ? 'bg-purple-50/95 border-purple-400 ring-2 ring-purple-500/20 shadow-md shadow-purple-500/5'
                            : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        {/* Top: Subject Badge + Question Count */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sess.subject === 'Biology'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : sess.subject === 'Chemistry'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : sess.subject === 'Physics'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            }`}
                          >
                            {sess.subject}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span>{userQCount} {userQCount === 1 ? 'Q' : 'Qs'}</span>
                          </span>
                        </div>

                        {/* Middle: Title with Inline Rename support */}
                        {editingSessionId === sess.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditTitle(sess.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-purple-400 bg-white outline-none focus:ring-2 focus:ring-purple-400 text-slate-900"
                            />
                            <button
                              onClick={() => handleSaveEditTitle(sess.id)}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Save Title"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingSessionId(null)}
                              className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors flex-1">
                              {sess.title}
                            </h4>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(sess.id);
                                setEditTitleValue(sess.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 transition-opacity"
                              title="Rename chat topic"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Bottom Row: Date, Time & Delete */}
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <span className="flex items-center gap-1 font-semibold text-slate-600">
                              <Calendar className="w-3 h-3 text-purple-500" />
                              <span>{dateBadge.text}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{sess.formattedTime}</span>
                            </span>
                          </div>

                          {/* Delete Session Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(sess.id, e);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                            title="Chat delete karein (Delete this chat)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-700" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer */}
              {sessions.length > 1 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{sessions.length} chats saved</span>
                  <button
                    onClick={handleClearAllSessions}
                    className="text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                  >
                    Clear all history
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ======================================================== */}
        {/* RIGHT: CHAT WORKSPACE */}
        {/* ======================================================== */}
        <div ref={chatScrollTargetRef} className="flex-1 min-w-0 w-full space-y-4">
          {/* Active Session Info Header */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {activeSession?.subject || subject}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {activeSession?.title || 'Current Consultation'}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{activeSession?.formattedDate}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{activeSession?.formattedTime}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors shadow-2xs active:scale-95"
                title="Start a fresh chat (Nayi chat shuru karein)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>

              <button
                onClick={handleDeleteActiveChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors shadow-2xs active:scale-95"
                title="Delete this active conversation (Ye chat delete karein)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Chat</span>
              </button>

              <button
                onClick={() => setIsSidebarOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                title="Toggle History Sidebar"
              >
                <History className="w-3.5 h-3.5" />
                <span>{isSidebarOpen ? 'Hide History' : `History (${sessions.length})`}</span>
              </button>
            </div>
          </div>

      {/* Context Selection Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Curriculum Filter:</span>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['Biology', 'Chemistry', 'Physics', 'English'] as SubjectName[]).map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSubject(sub);
                setChapter('');
                setMaterialId('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subject === sub
                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Chapter Selector */}
        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All {subject} Chapters</option>
          {filteredChapters.map((c) => (
            <option key={c.id} value={c.title}>
              Ch {c.chapterNumber}: {c.title}
            </option>
          ))}
        </select>

        {/* Material Selection */}
        {filteredMaterials.length > 0 && (
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/60 text-purple-900 outline-none focus:ring-2 focus:ring-purple-500 max-w-xs truncate"
          >
            <option value="">Attached Book/Material Context (Optional)</option>
            {filteredMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.type === 'Diagram / Image' ? '🖼️ ' : '📄 '}
                {m.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Preset Prompt Shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Prompts:
        </span>
        {presetPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold text-amber-950">AI Assistant Status</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError('');
              const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
              if (lastUserMsg) {
                handleSend(lastUserMsg.text);
              }
            }}
            className="self-end sm:self-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs active:scale-95"
          >
            🔄 Dobara Try Karein
          </button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs min-h-[480px] flex flex-col justify-between space-y-4">
        <div className="space-y-5 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-bold text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'MediPrep AI'}
                </span>
                {msg.contextTag && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                    {msg.contextTag}
                  </span>
                )}
                <span className="text-[10px] text-slate-300">{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 sm:p-6 rounded-2xl max-w-3xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-sm font-medium'
                    : 'bg-slate-50/90 text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs w-full'
                }`}
              >
                {/* User attached image thumbnail */}
                {msg.imagePreview && (
                  <div className="mb-3">
                    <img
                      src={msg.imagePreview}
                      alt="Uploaded question or diagram"
                      className="max-h-56 rounded-xl border border-white/20 bg-white/10 object-contain shadow-xs"
                    />
                  </div>
                )}

                {msg.sender === 'user' ? (
                  <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <FormattedMarkdown content={msg.text} fontSize={fontSize} />
                )}

                {msg.sender === 'ai' && msg.id !== 'welcome' && (
                  <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-cyan-600" /> Sindh Board & MDCAT Aligned
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Explain in Aasan Roman Urdu */}
                      <button
                        onClick={() =>
                          handleSend(
                            `Is answer ko bilkul aasan aur simple Roman Urdu (Aasan Urdu) mein samjhao taake har cheez crystal clear ho jaye.`
                          )
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold transition-colors"
                        title="Explain in simple Roman Urdu"
                      >
                        <Languages className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Aasan Urdu mein samjhein</span>
                      </button>

                      {/* Read Aloud / Stop Speech */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSpeak(msg.id, msg.text);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none active:scale-95 ${
                          speakingMsgId === msg.id
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400 hover:bg-rose-700'
                            : 'text-slate-700 hover:text-purple-700 bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50'
                        }`}
                        title={speakingMsgId === msg.id ? 'Tap to stop speech (Audio foran band karein)' : 'Listen to explanation'}
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <span className="relative flex h-2 w-2 pointer-events-none">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <Square className="w-3.5 h-3.5 fill-white pointer-events-none" />
                            <span className="pointer-events-none font-bold">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                            <span className="pointer-events-none">Listen</span>
                          </>
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Save Note */}
                      <button
                        onClick={() => handleSaveNote(msg)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>{savedNoteId === msg.id ? 'Saved in Notes!' : 'Save as Note'}</span>
                      </button>

                      {/* Make MCQs */}
                      <button
                        onClick={() => onNavigateToMCQGen(subject, chapter)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-semibold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Make MCQs</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                <span className="font-semibold text-purple-900">
                  Sindh Board curriculum & MDCAT past paper analysis in progress...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {/* Image Attachment Preview Badge */}
          {attachedImage && (
            <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="font-bold truncate">{attachedImage.name}</span>
                <span className="text-[10px] text-purple-600 px-1.5 py-0.2 bg-purple-200 rounded">Attached for AI</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1 rounded-md text-purple-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Audio Bar with Quick Stop button */}
          {speakingMsgId && (
            <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-slate-900 text-white shadow-xl animate-fadeIn text-xs border border-purple-500/40">
              <div className="flex items-center gap-2.5 truncate mr-3">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <Volume2 className="w-4 h-4 text-purple-300 flex-shrink-0 pointer-events-none" />
                <span className="font-semibold text-slate-100 truncate">
                  AI explanation sunayi ja rahi hai... (Playing audio)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stopSpeaking();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex-shrink-0 cursor-pointer"
                title="Audio foran band karein"
              >
                <Square className="w-3 h-3 fill-white pointer-events-none" />
                <span className="pointer-events-none font-bold">Band Karein (Stop)</span>
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Paperclip / Attach Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 transition-colors shadow-2xs flex-shrink-0"
              title="Attach diagram or question image to solve"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              ref={questionInputRef}
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Sawal likhein ya diagram attach karein (e.g. "Ye enzyme diagram solve kardo", "Explain in Aasan Urdu")...`}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-slate-900"
            />

            <button
              type="submit"
              disabled={loading || (!inputQuestion.trim() && !attachedImage)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Action Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-slideUp text-xs font-bold">
          {toastNotification.type === 'delete' ? (
            <Trash2 className="w-4 h-4 text-rose-400" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastNotification.message}</span>
        </div>
      )}
    </div>
  </div>
</div>
  );
};
