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
} from '../types';

export const api = {
  async resetData(): Promise<{ success: boolean; data: DatabaseSchema; status: DbStatus }> {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset study data');
    return res.json();
  },

  async getInit(): Promise<{ data: DatabaseSchema; status: DbStatus }> {
    const res = await fetch('/api/init');
    if (!res.ok) throw new Error('Failed to load application data');
    return res.json();
  },

  async getDbStatus(): Promise<DbStatus> {
    const res = await fetch('/api/db-status');
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return res.json();
  },

  async syncMongo(): Promise<{ success: boolean; message: string; status: DbStatus }> {
    const res = await fetch('/api/db-sync', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync with MongoDB');
    return res.json();
  },

  async testMongoConnection(uri: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/db-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  async toggleChapterStatus(chapterId: string, status?: 'not_started' | 'in_progress' | 'completed'): Promise<ChapterData> {
    const res = await fetch(`/api/chapters/${chapterId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update chapter');
    return res.json();
  },

  async getMaterials(params?: { subject?: string; type?: string; search?: string }): Promise<StudyMaterial[]> {
    const query = new URLSearchParams();
    if (params?.subject) query.set('subject', params.subject);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    const res = await fetch(`/api/materials?${query.toString()}`);
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
    const res = await fetch('/api/materials', {
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
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
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
    const res = await fetch(`/api/mcqs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch MCQs');
    return res.json();
  },

  async createMCQ(payload: Partial<MCQ>): Promise<MCQ> {
    const res = await fetch('/api/mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save MCQ');
    return res.json();
  },

  async saveBulkMCQs(mcqs: Partial<MCQ>[]): Promise<MCQ[]> {
    const res = await fetch('/api/mcqs/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mcqs }),
    });
    if (!res.ok) throw new Error('Failed to save MCQs');
    return res.json();
  },

  async toggleMCQBookmark(id: string): Promise<MCQ> {
    const res = await fetch(`/api/mcqs/${id}/bookmark`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to update bookmark');
    return res.json();
  },

  async toggleMCQDifficult(id: string): Promise<MCQ> {
    const res = await fetch(`/api/mcqs/${id}/difficult`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to mark difficult');
    return res.json();
  },

  async deleteMCQ(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/mcqs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete MCQ');
    return res.json();
  },

  async submitQuiz(payload: {
    title: string;
    subject: string;
    chapter: string;
    answers: {
      questionId: string;
      selectedOption: string;
      questionText?: string;
      options?: { A: string; B: string; C: string; D: string };
      correctOption?: string;
      explanation?: string;
      subject?: string;
      chapter?: string;
      topic?: string;
    }[];
    timeSpentSeconds: number;
    difficulty: string;
  }): Promise<QuizAttempt> {
    const res = await fetch('/api/quizzes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
  },

  async createNote(payload: Partial<StudyNote>): Promise<StudyNote> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save note');
    return res.json();
  },

  async updateNote(id: string, payload: Partial<StudyNote>): Promise<StudyNote> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update note');
    return res.json();
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');
    return res.json();
  },

  async createRevisionPlan(payload: Partial<RevisionPlanItem>): Promise<RevisionPlanItem> {
    const res = await fetch('/api/revision-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create revision plan');
    return res.json();
  },

  async updateRevisionPlan(id: string, payload: Partial<RevisionPlanItem>): Promise<RevisionPlanItem> {
    const res = await fetch(`/api/revision-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update revision plan');
    return res.json();
  },

  async deleteRevisionPlan(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/revision-plans/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete revision plan');
    return res.json();
  },

  async logStudySession(minutes: number): Promise<StudyState> {
    const res = await fetch('/api/study-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes }),
    });
    if (!res.ok) throw new Error('Failed to log study session');
    return res.json();
  },

  async searchGlobal(q: string) {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Gemini AI Services
  async askAi(payload: {
    question: string;
    subject?: string;
    chapter?: string;
    materialId?: string;
    customContext?: string;
    imageBase64?: string;
    imageMimeType?: string;
  }): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI generation failed');
    return data;
  },

  async getAiSessions(): Promise<ChatSession[]> {
    try {
      const res = await fetch('/api/ai/sessions');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async saveAiSession(session: ChatSession): Promise<ChatSession> {
    const res = await fetch('/api/ai/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    if (!res.ok) throw new Error('Failed to save chat session');
    return res.json();
  },

  async deleteAiSession(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/ai/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete chat session');
    return res.json();
  },

  async clearAllAiSessions(): Promise<{ success: boolean }> {
    const res = await fetch('/api/ai/sessions', {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear chat sessions');
    return res.json();
  },

  async generateAiMCQs(payload: {
    subject: SubjectName;
    chapter: string;
    topic?: string;
    sourceMaterialId?: string;
    numberOfMCQs: number;
    difficulty: string;
    questionType: string;
  }): Promise<{ mcqs: MCQ[] }> {
    const res = await fetch('/api/ai/generate-mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate MCQs with AI');
    return data;
  },

  async explainWrongAnswer(payload: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    selectedOption: string;
    correctOption: string;
    subject: string;
    chapter: string;
  }): Promise<{ explanation: string }> {
    const res = await fetch('/api/ai/explain-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate explanation');
    return data;
  },

  async getAiRevisionSuggestions(): Promise<{ suggestions: any[] }> {
    const res = await fetch('/api/ai/suggest-revision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get revision plan');
    return data;
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
    const res = await fetch(`/api/mistakes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch mistakes');
    return res.json();
  },

  async addMistake(payload: Partial<MistakeItem>): Promise<MistakeItem> {
    const res = await fetch('/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save mistake');
    return res.json();
  },

  async recordMistake(payload: {
    mcqId?: string;
    question: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    options: { A: string; B: string; C: string; D: string };
    selectedOption: string;
    correctOption: string;
    explanation?: string;
    userReason?: string;
    mistakeTag?: string;
  }): Promise<{ success: boolean; mistakes: MistakeItem[] }> {
    const res = await fetch('/api/mistakes/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record mistake');
    return res.json();
  },

  async updateMistake(
    id: string,
    payload: { userReason?: string; mistakeTag?: string; mastered?: boolean }
  ): Promise<MistakeItem> {
    const res = await fetch(`/api/mistakes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update mistake');
    return res.json();
  },

  async deleteMistake(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/mistakes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete mistake');
    return res.json();
  },

  async generateQuizFromMistakes(payload?: {
    subject?: string;
    limit?: number;
    unmasteredOnly?: boolean;
  }): Promise<{ quizTitle: string; subject: string; chapter: string; totalQuestions: number; mcqs: MCQ[] }> {
    const res = await fetch('/api/mistakes/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    if (!res.ok) throw new Error('Failed to generate quiz from mistakes');
    return res.json();
  },

  async getWeaknessAnalysis(): Promise<WeaknessAnalysisResponse> {
    const res = await fetch('/api/ai/weakness-analysis');
    if (!res.ok) throw new Error('Failed to fetch weakness analysis');
    return res.json();
  },

  async updateUserProfile(payload: Partial<UserProfile>): Promise<{ success: boolean; userProfile: UserProfile }> {
    const res = await fetch('/api/user-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async getPastPapers(): Promise<PastPaper[]> {
    const res = await fetch('/api/pastpapers');
    if (!res.ok) throw new Error('Failed to fetch past papers');
    return res.json();
  },

  async uploadPastPaper(payload: Partial<PastPaper>): Promise<PastPaper> {
    const res = await fetch('/api/pastpapers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload past paper');
    return data;
  },

  async deletePastPaper(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/pastpapers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete past paper');
    return res.json();
  },

  async extractTopicFromPastPapers(payload: {
    subject: SubjectName;
    chapter: string;
    topic?: string;
    paperIds?: string[];
    customPaperText?: string;
  }): Promise<{ questions: ExtractedPastPaperQuestion[]; summary: string; scannedPapersCount: number }> {
    const res = await fetch('/api/ai/pastpapers/extract', {
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
    const res = await fetch('/api/ai/pastpapers/generate-paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate mock paper');
    return data;
  },
};

