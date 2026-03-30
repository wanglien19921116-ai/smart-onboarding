import { Request } from 'express';

// 从 JWT 解码出的用户载荷
export interface JwtPayload {
  id: number;
  role: string;
}

// 带认证信息的请求对象
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// 考试提交答案的请求体
export interface ExamSubmitBody {
  answers: Record<string | number, string>;
}

// 用户岗位更新请求体
export interface UpdateJobRoleBody {
  jobRole: string;
}

// 课程进度更新请求体
export interface UpdateProgressBody {
  materialId: number;
}

// 学习时长记录请求体
export interface RecordStudyTimeBody {
  duration: number; // 分钟
}

// 考试提交后返回给前端的题目详情（含答案）
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
