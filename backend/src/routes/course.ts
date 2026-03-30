import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest, UpdateProgressBody, RecordStudyTimeBody } from '../types';
import { authMiddleware } from '../middleware';

const router = Router();

// ── 获取全部课程（含用户进度）──────────────────────────
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
  const courses = await prisma.course.findMany({
    include: {
      materials: true,
      progresses: {
        where: { userId: req.user!.id }
      }
    }
  });
  res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ── 获取单个课程 ─────────────────────────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id as string);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      materials: true,
      progresses: {
        where: { userId: req.user!.id }
      }
    }
  });
  res.json(course);
});

// ── 更新课程进度 ──────────────────────────────────────
router.post('/:id/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id as string);
  const { materialId } = req.body as UpdateProgressBody;

  try {
    const totalMaterials = await prisma.material.count({ where: { courseId } });
    if (totalMaterials === 0) {
      return res.status(400).json({ error: 'No materials in this course' });
    }

    let progressRecord = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId } }
    });

    let completedMaterials: number[] = [];
    if (progressRecord) {
      completedMaterials = JSON.parse(progressRecord.completedMaterials);
    }

    if (!completedMaterials.includes(materialId)) {
      completedMaterials.push(materialId);
    }

    const progressPercentage = Math.round((completedMaterials.length / totalMaterials) * 100);
    const completed = progressPercentage >= 100;

    const result = await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId: req.user!.id, courseId } },
      update: {
        progress: progressPercentage,
        completed,
        completedMaterials: JSON.stringify(completedMaterials)
      },
      create: {
        userId: req.user!.id,
        courseId,
        progress: progressPercentage,
        completed,
        completedMaterials: JSON.stringify(completedMaterials)
      }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// ── 【新增】记录学习时长 ──────────────────────────────
router.post('/study-time', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { duration } = req.body as RecordStudyTimeBody;

  if (!duration || duration <= 0) {
    return res.status(400).json({ error: 'Invalid duration' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.studyRecord.upsert({
      where: {
        userId_date: { userId: req.user!.id, date: today }
      },
      update: {
        duration: { increment: duration }
      },
      create: {
        userId: req.user!.id,
        date: today,
        duration
      }
    });

    res.json(record);
  } catch (err) {
    console.error('Record study time error:', err);
    res.status(500).json({ error: 'Failed to record study time' });
  }
});

// ── 【新增】获取学习统计 ──────────────────────────────
router.get('/study-stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日学习时长
    const todayRecord = await prisma.studyRecord.findUnique({
      where: { userId_date: { userId: req.user!.id, date: today } }
    });

    // 累计学习时长
    const allRecords = await prisma.studyRecord.aggregate({
      where: { userId: req.user!.id },
      _sum: { duration: true }
    });

    res.json({
      todayMinutes: todayRecord?.duration || 0,
      totalMinutes: allRecords._sum.duration || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch study stats' });
  }
});

export default router;
