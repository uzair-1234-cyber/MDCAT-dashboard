import {
  DatabaseSchema,
  DbStatus,
  StudyMaterial,
  MCQ,
  QuizAttempt,
  MistakeItem,
  WeaknessAnalysisResponse,
  StudyNote,
  RevisionPlanItem,
  ChapterData,
  StudyState,
  SubjectName,
  UserProfile,
  PastPaper,
  ExtractedPastPaperQuestion,
  GeneratedMockPaper,
  ChatSession,
  AuthUser,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordPayload,
} from '../types';

const TOKEN_KEY = 'mediprep_auth_token';
const USER_KEY = 'mediprep_user_data';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (_) {}
  },
  getUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user: AuthUser | null) {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (_) {}
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (_) {}
  },
};

async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  const token = authStorage.getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}

export const api = {
  // Authentication & User Account Methods
  async register(payload: RegisterCredentials): Promise<AuthResponse> {
    let res: Response;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Fallback if older backend route /api/auth/signup is active
      if (res.status === 404) {
        res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (netErr: any) {
      throw new Error('Network connection error. Please check your internet connection.');
    }

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const errorMsg = data.message || data.error || (res.status === 409 ? 'An account with this email already exists.' : 'Registration failed. Please try again.');
      throw new Error(errorMsg);
    }

    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async login(payload: LoginCredentials): Promise<AuthResponse> {
    let res: Response;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (netErr: any) {
      throw new Error('Network connection error. Please check your internet connection.');
    }

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const errorMsg = data.message || data.error || 'Invalid email or password. Please verify your credentials.';
      throw new Error(errorMsg);
    }

    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: AuthUser }> {
    const res = await authFetch('/api/auth/me');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Not authenticated');
    authStorage.setUser(data.user);
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    authStorage.clear();
    return { success: true };
  },

  async updateAuthProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; user: AuthUser; message?: string }> {
    const res = await authFetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    if (data.user) authStorage.setUser(data.user);
    return data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const res = await authFetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  },

  getToken(): string | null {
    return authStorage.getToken();
  },

  getStoredUser(): AuthUser | null {
    return authStorage.getUser();
  },

  // App Data & Core APIs
  async resetData(): Promise<{ success: boolean; data: DatabaseSchema; status: DbStatus }> {
    const res = await authFetch('/api/reset-data', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset study data');
    return res.json();
  },

  async getInit(): Promise<{ data: DatabaseSchema; status: DbStatus }> {
    const res = await authFetch('/api/init');
    if (!res.ok) throw new Error('Failed to load application data');
    return res.json();
  },

  async getDbStatus(): Promise<DbStatus> {
    const res = await authFetch('/api/db-status');
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  async syncMongo(): Promise<{ success: boolean; message: string; status: DbStatus }> {
    const res = await authFetch('/api/db-sync', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync with MongoDB');
    return res.json();
  },

  async testMongoConnection(uri: string): Promise<{ success: boolean; message: string }> {
    const res = await authFetch('/api/db-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  async toggleChapterStatus(chapterId: string, status?: 'not_started' | 'in_progress' | 'completed'): Promise<ChapterData> {
    const res = await authFetch(`/api/chapters/${chapterId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update chapter');
    return res.json();
  },

  async addChapter(payload: {
    subject: SubjectName;
    chapterNumber?: number;
    title: string;
    topics?: string[];
    classYear?: '1st Year' | '2nd Year';
  }): Promise<ChapterData> {
    const res = await authFetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create chapter');
    return res.json();
  },

  async addChaptersBatch(payload: {
    chapters: Array<{
      subject: SubjectName;
      chapterNumber?: number;
      title: string;
      topics?: string[];
      classYear?: '1st Year' | '2nd Year';
    }>;
  }): Promise<ChapterData[]> {
    const res = await authFetch('/api/chapters/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add chapters');
    return res.json();
  },

  async getMaterials(params?: { subject?: string; type?: string; search?: string }): Promise<StudyMaterial[]> {
    const query = new URLSearchParams();
    if (params?.subject) query.set('subject', params.subject);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    const res = await authFetch(`/api/materials?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  async createMaterial(payload: {
    title: string;
    subject: SubjectName;
    chapter: string;
    topic?: string;
    type: string;
    description?: string;
    contentSnippet?: string;
    tags?: string[];
    fileName?: string;
    fileBase64?: string;
    fileSize?: string;
  }): Promise<StudyMaterial> {
    const res = await authFetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create material');
    }
    return res.json();
  },

  async deleteMaterial(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/materials/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete material');
    return res.json();
  },

  async getMCQs(params?: {
    subject?: string;
    chapter?: string;
    difficulty?: string;
    bookmarked?: boolean;
    difficult?: boolean;
    search?: string;
  }): Promise<MCQ[]> {
    const query = new URLSearchParams();
    if (params?.subject) query.set('subject', params.subject);
    if (params?.chapter) query.set('chapter', params.chapter);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.bookmarked) query.set('bookmarked', 'true');
    if (params?.difficult) query.set('difficult', 'true');
    if (params?.search) query.set('search', params.search);
    const res = await authFetch(`/api/mcqs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch MCQs');
    return res.json();
  },

  async createMCQ(payload: Partial<MCQ>): Promise<MCQ> {
    const res = await authFetch('/api/mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save MCQ');
    return res.json();
  },

  async saveBulkMCQs(mcqs: Partial<MCQ>[]): Promise<MCQ[]> {
    const res = await authFetch('/api/mcqs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mcqs }),
    });
    if (!res.ok) throw new Error('Failed to save MCQs');
    return res.json();
  },

  async toggleMCQBookmark(id: string): Promise<MCQ> {
    const res = await authFetch(`/api/mcqs/${id}/bookmark`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to update bookmark');
    return res.json();
  },

  async toggleMCQDifficult(id: string): Promise<MCQ> {
    const res = await authFetch(`/api/mcqs/${id}/difficult`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to update difficulty tag');
    return res.json();
  },

  async deleteMCQ(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/mcqs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete MCQ');
    return res.json();
  },

  async getQuizzes(): Promise<QuizAttempt[]> {
    const res = await authFetch('/api/quizzes');
    if (!res.ok) throw new Error('Failed to fetch quizzes');
    return res.json();
  },

  async submitQuiz(payload: {
    title: string;
    subject: string;
    chapter: string;
    answers?: any[];
    answersSummary?: any[];
    timeSpentSeconds: number;
    difficulty?: string;
    totalQuestions?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    skippedQuestions?: number;
    scorePercentage?: number;
    weakTopics?: string[];
  }): Promise<QuizAttempt & { attempt: QuizAttempt; updatedStudyState: StudyState }> {
    const answersList = payload.answersSummary || payload.answers || [];
    const totalQuestions = payload.totalQuestions ?? answersList.length;
    const correctAnswers = payload.correctAnswers ?? answersList.filter((a: any) => a.isCorrect).length;
    const wrongAnswers = payload.wrongAnswers ?? (totalQuestions - correctAnswers);
    const scorePercentage =
      payload.scorePercentage ?? (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0);

    const res = await authFetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        scorePercentage,
        answersSummary: answersList,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz attempt');
    const data = await res.json();
    const attempt = data.attempt || data;
    return {
      ...attempt,
      attempt,
      updatedStudyState: data.updatedStudyState || {
        dailyStreak: 1,
        todayStudyMinutes: 30,
        todayGoalMinutes: 180,
        lastStudyDate: new Date().toISOString().split('T')[0],
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 30],
      },
    };
  },

  async getNotes(params?: { subject?: string; search?: string }): Promise<StudyNote[]> {
    const query = new URLSearchParams();
    if (params?.subject) query.set('subject', params.subject);
    if (params?.search) query.set('search', params.search);
    const res = await authFetch(`/api/notes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  async createNote(payload: Partial<StudyNote>): Promise<StudyNote> {
    const res = await authFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save study note');
    return res.json();
  },

  async updateNote(id: string, payload: Partial<StudyNote>): Promise<StudyNote> {
    const res = await authFetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');
    return res.json();
  },

  async getRevisionPlans(): Promise<RevisionPlanItem[]> {
    const res = await authFetch('/api/revision-plans');
    if (!res.ok) throw new Error('Failed to fetch revision plans');
    return res.json();
  },

  async createRevisionPlan(payload: Partial<RevisionPlanItem>): Promise<RevisionPlanItem> {
    const res = await authFetch('/api/revision-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to schedule revision plan');
    return res.json();
  },

  async updateRevisionPlan(id: string, payload: Partial<RevisionPlanItem>): Promise<RevisionPlanItem> {
    const res = await authFetch(`/api/revision-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update revision plan');
    return res.json();
  },

  async deleteRevisionPlan(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/revision-plans/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete revision plan');
    return res.json();
  },

  async recordStudySession(minutes: number): Promise<StudyState> {
    const res = await authFetch('/api/study-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes }),
    });
    if (!res.ok) throw new Error('Failed to record study session');
    return res.json();
  },

  async globalSearch(q: string): Promise<{
    materials: StudyMaterial[];
    mcqs: MCQ[];
    notes: StudyNote[];
    chapters: ChapterData[];
  }> {
    const res = await authFetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async askAiAssistant(payload: {
    question: string;
    subject?: string;
    chapter?: string;
    materialId?: string;
    sourceExcerpt?: string;
    conversationHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
    imageBase64?: string;
  }): Promise<{ answer: string; modelUsed: string }> {
    const res = await authFetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Assistant request failed');
    return data;
  },

  async getAiSessions(): Promise<ChatSession[]> {
    try {
      const res = await authFetch('/api/ai/sessions');
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async saveAiSession(session: ChatSession): Promise<{ success: boolean; session: ChatSession }> {
    const res = await authFetch('/api/ai/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save chat session');
    return data;
  },

  async deleteAiSession(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/ai/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete chat session');
    return data;
  },

  async clearAllAiSessions(): Promise<{ success: boolean }> {
    const res = await authFetch('/api/ai/sessions', {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear chat sessions');
    return data;
  },

  async generateAiMCQs(payload: {
    subject: string;
    chapter: string;
    topic?: string;
    numberOfQuestions?: number;
    numberOfMCQs?: number;
    difficulty: string;
    questionType: string;
    sourceMaterialId?: string;
    customPrompt?: string;
    classYear?: string;
  }): Promise<{ mcqs: MCQ[]; modelUsed: string; count: number }> {
    const res = await authFetch('/api/ai/generate-mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        numberOfQuestions: payload.numberOfQuestions || payload.numberOfMCQs || 5,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'MCQ generation failed');
    return data;
  },

  async explainAnswerWithAi(payload: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer?: string;
    correctOption?: string;
    userSelectedAnswer?: string;
    selectedOption?: string;
    subject: string;
    chapter?: string;
  }): Promise<{ explanation: string; mnemonics?: string }> {
    const res = await authFetch('/api/ai/explain-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        correctAnswer: payload.correctAnswer || payload.correctOption || 'A',
        userSelectedAnswer: payload.userSelectedAnswer || payload.selectedOption || '',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Explanation request failed');
    return data;
  },

  async getAiRevisionSuggestion(): Promise<{
    suggestion: string;
    suggestions: any[];
    targetChapters: string[];
    prioritySubject: string;
  }> {
    const res = await authFetch('/api/ai/suggest-revision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get revision plan');
    const suggestionText = data.suggestion || '';
    const suggestionsList = Array.isArray(data.suggestions)
      ? data.suggestions
      : [
          {
            title: 'High-Yield Chapter Priority',
            description: suggestionText,
            subject: data.prioritySubject || 'Biology',
          },
        ];
    return {
      ...data,
      suggestion: suggestionText,
      suggestions: suggestionsList,
      targetChapters: data.targetChapters || [],
      prioritySubject: data.prioritySubject || 'Biology',
    };
  },

  async getMistakes(params?: {
    subject?: string;
    chapter?: string;
    mastered?: boolean;
    search?: string;
  }): Promise<MistakeItem[]> {
    const query = new URLSearchParams();
    if (params?.subject) query.set('subject', params.subject);
    if (params?.chapter) query.set('chapter', params.chapter);
    if (params?.mastered !== undefined) query.set('mastered', String(params.mastered));
    if (params?.search) query.set('search', params.search);
    const res = await authFetch(`/api/mistakes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch mistake book');
    return res.json();
  },

  async createMistake(payload: Partial<MistakeItem>): Promise<MistakeItem> {
    const res = await authFetch('/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record mistake');
    return res.json();
  },

  async recordMistakesBatch(mistakes: Array<{
    mcqId?: string;
    question: string;
    subject: SubjectName;
    chapter: string;
    topic?: string;
    options: { A: string; B: string; C: string; D: string };
    selectedOption: string;
    correctOption: 'A' | 'B' | 'C' | 'D';
    selectedText?: string;
    correctText?: string;
    explanation?: string;
    mistakeTag?: string;
    userReason?: string;
  }>): Promise<{ success: boolean; mistakes: MistakeItem[] }> {
    const res = await authFetch('/api/mistakes/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistakes }),
    });
    if (!res.ok) throw new Error('Failed to record mistakes');
    return res.json();
  },

  async updateMistake(id: string, payload: {
    userReason?: string;
    mistakeTag?: string;
    mastered?: boolean;
  }): Promise<MistakeItem> {
    const res = await authFetch(`/api/mistakes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update mistake record');
    return res.json();
  },

  async deleteMistake(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/mistakes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete mistake');
    return res.json();
  },

  async generateQuizFromMistakes(payload: {
    subject?: string;
    limit?: number;
    unmasteredOnly?: boolean;
  }): Promise<{ questions: MCQ[]; mcqs: MCQ[]; count: number; quizTitle: string }> {
    const res = await authFetch('/api/mistakes/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate mistake test');
    const data = await res.json();
    const questions: MCQ[] = data.questions || [];
    return {
      ...data,
      questions,
      mcqs: questions,
      quizTitle: `${payload.subject || 'Sindh MDCAT'} Mistakes Drill`,
    };
  },

  async getAiWeaknessAnalysis(): Promise<WeaknessAnalysisResponse> {
    const res = await authFetch('/api/ai/weakness-analysis');
    if (!res.ok) throw new Error('Failed to analyze weak areas');
    return res.json();
  },

  async updateUserProfile(profile: Partial<UserProfile>): Promise<{ success: boolean; userProfile: UserProfile; user?: AuthUser }> {
    const res = await authFetch('/api/user-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const data = await res.json();
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  async getPastPapers(): Promise<PastPaper[]> {
    const res = await authFetch('/api/pastpapers');
    if (!res.ok) throw new Error('Failed to fetch past papers');
    return res.json();
  },

  async createPastPaper(payload: Partial<PastPaper>): Promise<PastPaper> {
    const res = await authFetch('/api/pastpapers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to upload past paper');
    return res.json();
  },

  async deletePastPaper(id: string): Promise<{ success: boolean }> {
    const res = await authFetch(`/api/pastpapers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete past paper');
    return res.json();
  },

  async extractQuestionsFromPaper(payload: {
    subject: SubjectName;
    chapter: string;
    paperIds?: string[];
    count?: number;
  }): Promise<{ questions: ExtractedPastPaperQuestion[]; count: number; modelUsed: string }> {
    const res = await authFetch('/api/ai/pastpapers/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to extract past paper questions');
    return data;
  },

  async generateMockPaper(payload: {
    subject: SubjectName | 'Full MDCAT Combo';
    chapters?: string[];
    numberOfQuestions: number;
    difficulty?: string;
    paperTitle?: string;
    focusArea?: string;
  }): Promise<GeneratedMockPaper> {
    const res = await authFetch('/api/ai/pastpapers/generate-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate mock paper');
    return data;
  },

  // Backwards-Compatible Aliases
  async logStudySession(minutes: number): Promise<StudyState> {
    return this.recordStudySession(minutes);
  },

  async recordMistake(payload: Partial<MistakeItem>): Promise<MistakeItem & { mistakes?: MistakeItem[] }> {
    const item = await this.createMistake(payload);
    return {
      ...item,
      mistakes: [item],
    };
  },

  async getWeaknessAnalysis(): Promise<WeaknessAnalysisResponse> {
    return this.getAiWeaknessAnalysis();
  },

  async searchGlobal(q: string) {
    return this.globalSearch(q);
  },

  async askAi(payload: {
    question: string;
    subject?: string;
    chapter?: string;
    materialId?: string;
    sourceExcerpt?: string;
    conversationHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[];
    imageBase64?: string;
    imageMimeType?: string;
  }): Promise<{ answer: string; reply: string; modelUsed: string }> {
    const res = await this.askAiAssistant(payload);
    return {
      ...res,
      reply: res.answer,
    };
  },

  async uploadPastPaper(payload: Partial<PastPaper>): Promise<PastPaper> {
    return this.createPastPaper(payload);
  },

  async extractTopicFromPastPapers(payload: {
    subject: SubjectName;
    chapter: string;
    topic?: string;
    paperIds?: string[];
    count?: number;
    customPaperText?: string;
  }): Promise<{ questions: ExtractedPastPaperQuestion[]; count: number; modelUsed: string; summary: string }> {
    const res = await this.extractQuestionsFromPaper(payload);
    return {
      ...res,
      summary: `Extracted ${res.count} high-yield questions for ${payload.subject} - ${payload.chapter}.`,
    };
  },

  async explainWrongAnswer(payload: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer?: string;
    correctOption?: string;
    userSelectedAnswer?: string;
    selectedOption?: string;
    subject: string;
    chapter?: string;
  }) {
    return this.explainAnswerWithAi(payload);
  },

  async getAiRevisionSuggestions() {
    return this.getAiRevisionSuggestion();
  },

  async getCloudinaryStatus(): Promise<{
    configured: boolean;
    cloudName: string;
    hasApiKey: boolean;
    hasApiSecret: boolean;
    statusText: string;
  }> {
    const res = await fetch('/api/cloudinary/status');
    if (!res.ok) {
      return {
        configured: false,
        cloudName: 'Not configured',
        hasApiKey: false,
        hasApiSecret: false,
        statusText: 'Could not reach server',
      };
    }
    return res.json();
  },
};
