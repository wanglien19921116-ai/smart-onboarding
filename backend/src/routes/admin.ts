import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../types';
import { authMiddleware, adminMiddleware } from '../middleware';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Supabase 存储配置
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ storage: multer.memoryStorage() });

// ── 文件上传（到 Supabase Storage）─────────────────────
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const file = req.file;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);

    const { data, error } = await supabase.storage
      .from('smart-onboarding')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload to cloud storage' });
    }

    const { data: publicUrlData } = supabase.storage
      .from('smart-onboarding')
      .getPublicUrl(fileName);

    res.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error('Upload handler error:', err);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━ 课程管理 ━━━━━━━━━━━━━━━━━━━━

router.post('/courses', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description, category, isRequired, duration } = req.body;
  try {
    const course = await prisma.course.create({
      data: { title, description, category, isRequired, duration }
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id as string);
  const { title, description, category, isRequired, duration } = req.body;
  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description, category, isRequired, duration }
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id as string);
  try {
    await prisma.material.deleteMany({ where: { courseId } });
    await prisma.courseProgress.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━ 课程资料管理 ━━━━━━━━━━━━━━━━━━━━

router.post('/courses/:id/materials', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const courseId = parseInt(req.params.id as string);
  const { title, type, url } = req.body;
  try {
    const material = await prisma.material.create({
      data: { title, type, url, courseId }
    });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add material' });
  }
});

router.delete('/materials/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const materialId = parseInt(req.params.id as string);
  try {
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // 如果是本地上传的文件，尝试删除物理文件
    if (material.url.startsWith('http://localhost:3000/uploads/')) {
      const filename = material.url.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.material.delete({ where: { id: materialId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━ 考试管理 ━━━━━━━━━━━━━━━━━━━━

router.get('/exams', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { questions: true }
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

router.post('/exams', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description, examType, relatedId } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: { title, description, examType, relatedId }
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

router.put('/exams/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const examId = parseInt(req.params.id as string);
  const { title, description, examType, relatedId } = req.body;
  try {
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: { title, description, examType, relatedId }
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

router.delete('/exams/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const examId = parseInt(req.params.id as string);
  try {
    // 先删除关联的错题记录
    const questionIds = await prisma.question.findMany({ where: { examId }, select: { id: true } });
    if (questionIds.length > 0) {
      await prisma.wrongQuestion.deleteMany({
        where: { questionId: { in: questionIds.map(q => q.id) } }
      });
    }
    await prisma.question.deleteMany({ where: { examId } });
    await prisma.examResult.deleteMany({ where: { examId } });
    await prisma.exam.delete({ where: { id: examId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// ━━━━━━━━━━━━━━━━━━━━ 题目管理 ━━━━━━━━━━━━━━━━━━━━

router.post('/exams/:id/questions', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const examId = parseInt(req.params.id as string);
  const { content, type, options, answer, score, explanation } = req.body;
  try {
    const question = await prisma.question.create({
      data: {
        examId,
        content,
        type,
        options: JSON.stringify(options),
        answer,
        explanation,
        score
      }
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

router.put('/questions/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const questionId = parseInt(req.params.id as string);
  const { content, type, options, answer, score, explanation } = req.body;
  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        content,
        type,
        options: JSON.stringify(options),
        answer,
        explanation,
        score
      }
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/questions/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const questionId = parseInt(req.params.id as string);
  try {
    // 先删除关联的错题记录
    await prisma.wrongQuestion.deleteMany({ where: { questionId } });
    await prisma.question.delete({ where: { id: questionId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
