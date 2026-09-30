export type SubjectName = 'Biology' | 'Chemistry' | 'Physics' | 'English';

export interface SubjectData {
  id: string;
  name: SubjectName;
  chaptersCount: number;
  description: string;
  color: string;
  badge: string;
}

export interface ChapterData {
  id: string;
  subject: SubjectName;
  chapterNumber: number;
  title: string;
  topics: string[];
  completed: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  notesCount: number;
  mcqsCount: number;
}

export type MaterialType = 'Book' | 'PDF' | 'Notes' | 'MCQs' | 'Question Paper' | 'Diagram / Image' | 'Other';

export interface StudyMaterial {
  id: string;
  title: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  type: MaterialType;
  description: string;
  fileName?: string;
  fileUrl?: string;
  fileBase64?: string;
  fileSize?: string;
  contentSnippet?: string;
  uploadDate: string;
  tags: string[];
  bookmarked?: boolean;
}

export const isMaterialImage = (mat: Partial<StudyMaterial>): boolean => {
  if (mat.type === 'Diagram / Image') return true;
  const target = `${mat.fileName || ''} ${mat.fileUrl || ''}`.toLowerCase();
  return (
    target.endsWith('.png') ||
    target.endsWith('.jpg') ||
    target.endsWith('.jpeg') ||
    target.endsWith('.webp') ||
    target.endsWith('.gif') ||
    target.endsWith('.svg') ||
    target.includes('.png') ||
    target.includes('.jpg') ||
    target.includes('.jpeg') ||
    target.includes('.webp') ||
    Boolean(mat.fileBase64?.startsWith('data:image/'))
  );
};

export interface MCQ {
  id: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'MDCAT Level';
  questionType: 'Conceptual' | 'Factual' | 'Application-based' | 'Mixed';
  source: string;
  isBookmarked?: boolean;
  isDifficult?: boolean;
  createdAt: string;
}

export interface QuizAnswerSummary {
  questionId: string;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  difficulty: string;
  date: string;
  weakTopics: string[];
  answersSummary: QuizAnswerSummary[];
}

export interface StudyNote {
  id: string;
  title: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  content: string;
  tags: string[];
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionPlanItem {
  id: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  date: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: 'mcq_generated' | 'quiz_completed' | 'pdf_uploaded' | 'note_created' | 'ai_question' | 'chapter_completed';
  timestamp: string;
}

export interface StudyState {
  dailyStreak: number;
  todayStudyMinutes: number;
  todayGoalMinutes: number;
  lastStudyDate: string;
  weeklyMinutes: number[];
}

export interface UserProfile {
  name: string;
  aspirantType: string;
  targetExam: string;
  targetYear: string;
  dreamMedicalCollege: string;
  personalMotto: string;
}

export interface MistakeItem {
  id: string;
  mcqId?: string;
  question: string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  selectedText?: string;
  correctText?: string;
  explanation: string;
  userReason?: string; // e.g. "Chromosome alignment confused."
  mistakeTag?: string; // e.g. "Conceptual Gap", "Misread Question"
  wrongCount: number;
  mastered: boolean;
  createdAt: string;
  lastAttemptedAt: string;
}

export interface WeakAreaItem {
  subject: SubjectName;
  topicOrChapter: string;
  wrongCount: number;
  totalAttempts: number;
  accuracyPercentage: number;
  repeatedMistakeDetected: boolean;
  severity: 'High' | 'Medium' | 'Low';
  aiObservation: string;
  recommendedRevisionMins: number;
  actionText: string;
}

export interface WeaknessAnalysisResponse {
  topWeakAreas: WeakAreaItem[];
  overallSummary: string;
  aiPrescription: string;
  recommendedRevisionMins: number;
  totalMistakesCount: number;
  unmasteredMistakesCount: number;
}

export interface PastPaper {
  id: string;
  title: string;
  year: number | string;
  conductingBody: string; // e.g. 'DUHS (Sindh)', 'UHS (Punjab)', 'SZABMU (Federal)', 'NUMS', 'National MDCAT'
  subjectsCovered: SubjectName[];
  questionsCount: number;
  fileName?: string;
  fileUrl?: string;
  fileBase64?: string;
  rawContentSnippet?: string;
  uploadedAt: string;
  isCurated?: boolean;
}

export interface ExtractedPastPaperQuestion {
  id: string;
  paperTitle: string;
  year: string;
  questionNumber?: number | string;
  subject: SubjectName;
  chapter: string;
  topic: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  examAppearance: string;
}

export interface GeneratedMockPaper {
  id: string;
  title: string;
  subject: SubjectName | 'Full MDCAT Combo';
  totalQuestions: number;
  durationMinutes: number;
  instructions: string[];
  basedOnPapers: string[];
  questions: MCQ[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextTag?: string;
  imagePreview?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  subject: SubjectName;
  chapter: string;
  createdAt: string;
  updatedAt: string;
  formattedDate: string;
  formattedTime: string;
  messages: ChatMessage[];
}

export interface DatabaseSchema {
  subjects: SubjectData[];
  chapters: ChapterData[];
  materials: StudyMaterial[];
  mcqs: MCQ[];
  quizAttempts: QuizAttempt[];
  mistakes: MistakeItem[];
  notes: StudyNote[];
  revisionPlans: RevisionPlanItem[];
  activities: ActivityItem[];
  studyState: StudyState;
  userProfile: UserProfile;
  pastPapers?: PastPaper[];
  aiSessions?: ChatSession[];
}

export interface DbStatus {
  connectedToMongo: boolean;
  mongoUriSet: boolean;
  maskedUri: string | null;
  databaseName?: string | null;
  lastError: string | null;
  storageMode: string;
  totalMaterials: number;
  totalMCQs: number;
  totalNotes: number;
  quizzesAttempted: number;
  totalMistakes?: number;
  mongoCollectionCounts?: {
    materials?: number;
    mcqs?: number;
    notes?: number;
    quizAttempts?: number;
    revisionPlans?: number;
    activities?: number;
    mistakes?: number;
  };
  lastMongoSync?: string | null;
  geminiConnected: boolean;
}
