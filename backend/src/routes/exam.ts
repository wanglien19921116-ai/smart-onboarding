import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest, ExamSubmitBody, QuestionDetail } from '../types';
import { authMiddleware } from '../middleware';

const router = Router();

// ── 获取全部考试列表 ──────────────────────────────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const exams = await prisma.exam.findMany();
  res.json(exams);
});

// ── 获取单个考试（含题目，不含答案）────────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const examId = parseInt(req.params.id as string);
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        select: {
          id: true,
          content: true,
          type: true,
          options: true,
          score: true
          // 不返回 answer，防止作弊
        }
      }
    }
  });
  res.json(exam);
});

// ── 提交考试（含正确答案返回 + 错题本自动入库）──────────
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  const examId = parseInt(req.params.id as string);
  const { answers } = req.body as ExamSubmitBody;

  try {
    const questions = await prisma.question.findMany({ where: { examId } });

    let totalScore = 0;
    let maxScore = 0;
    const details: QuestionDetail[] = [];
    const wrongEntries: { questionId: number; wrongAnswer: string }[] = [];

    questions.forEach(q => {
      maxScore += q.score;
      const userAnswer = answers[q.id] || answers[q.id.toString()];
      const isCorrect = userAnswer === q.answer;

      if (isCorrect) {
        totalScore += q.score;
      } else {
        // 收集错题，稍后批量写入
        wrongEntries.push({
          questionId: q.id,
          wrongAnswer: userAnswer || ''
        });
      }

      details.push({
        questionId: q.id,
        content: q.content,
        correctAnswer: q.answer,
        userAnswer,
        isCorrect,
        explanation: q.explanation,
        score: q.score,
        earnedScore: isCorrect ? q.score : 0
      });
    });

    const passed = maxScore > 0 ? (totalScore / maxScore) >= 0.6 : false;

    // 保存考试结果
    const result = await prisma.examResult.create({
      data: {
        userId: req.user!.id,
        examId,
        score: totalScore,
        passed
      }
    });

    // 【新增】将错题自动写入 WrongQuestion 表
    if (wrongEntries.length > 0) {
      await Promise.all(
        wrongEntries.map(entry =>
          prisma.wrongQuestion.upsert({
            where: {
              userId_questionId: {
                userId: req.user!.id,
                questionId: entry.questionId
              }
            },
            update: {
              wrongAnswer: entry.wrongAnswer,
              isMastered: false, // 重新标记为未掌握
              updatedAt: new Date()
            },
            create: {
              userId: req.user!.id,
              questionId: entry.questionId,
              wrongAnswer: entry.wrongAnswer
            }
          })
        )
      );
    }

    // 返回含有答案和解析的完整结果
    res.json({
      ...result,
      totalScore,
      maxScore,
      passed,
      details // 前端可根据此数组渲染每道题的对/错和解析
    });
  } catch (err) {
    console.error('Exam submit error:', err);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// ── 【新增】获取用户考试历史（含通过率统计）─────────────
router.get('/results/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const allResults = await prisma.examResult.findMany({
      where: { userId: req.user!.id }
    });

    const totalExams = allResults.length;
    const passedExams = allResults.filter(r => r.passed).length;
    const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    res.json({
      totalExams,
      passedExams,
      passRate,
      results: allResults
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exam stats' });
  }
});

// ── 【新增】获取错题本 ────────────────────────────────
router.get('/wrong-questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const wrongQuestions = await prisma.wrongQuestion.findMany({
      where: { userId: req.user!.id },
      include: {
        question: {
          include: { exam: { select: { title: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(wrongQuestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wrong questions' });
  }
});

export default router;
