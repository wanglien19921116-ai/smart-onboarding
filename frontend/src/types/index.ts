// ── 用户相关 ──────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  role: 'admin' | 'employee';
  jobRole?: string;
}

// ── 课程相关 ──────────────────────────────────────────
export interface Material {
  id: number;
  title: string;
  type: 'video' | 'document';
  url: string;
  courseId: number;
}

export interface CourseProgress {
  id: number;
  userId: number;
  courseId: number;
  completed: boolean;
  progress: number;
  completedMaterials: string; // JSON array
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  category: string;
  isRequired: boolean;
  duration: number;
  materials: Material[];
  progresses: CourseProgress[];
}

// ── 考试相关 ──────────────────────────────────────────
export interface Question {
  id: number;
  content: string;
  type: 'single_choice' | 'multiple_choice' | 'boolean';
  options: string; // JSON string
  score: number;
  answer?: string; // 仅提交后由后端返回
  explanation?: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  examType: string;
  relatedId: number | null;
  questions?: Question[];
}

// ── 考试提交结果 ──────────────────────────────────────
export interface QuestionDetail {
  questionId: number;
  content: string;
  correctAnswer: string;
  userAnswer: string | undefined;
  isCorrect: boolean;
  explanation: string | null;
  score: number;
  earnedScore: number;
}

export interface ExamSubmitResult {
  id: number;
  userId: number;
  examId: number;
  score: number;
  passed: boolean;
  totalScore: number;
  maxScore: number;
  details: QuestionDetail[];
}

// ── 学习统计 ──────────────────────────────────────────
export interface StudyStats {
  todayMinutes: number;
  totalMinutes: number;
}

export interface ExamStats {
  totalExams: number;
  passedExams: number;
  passRate: number;
}
