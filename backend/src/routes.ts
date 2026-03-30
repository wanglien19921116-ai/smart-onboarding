import { Router } from 'express';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// TODO: 需要您在飞书开发者后台获取并替换以下凭证
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || 'cli_a94b8df043f8dcc6';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '54QRTQLdbyf2tDHigrilWcIR1OIQE2ua';
// 飞书重定向地址需要和飞书后台配置的一致，前端页面
const FEISHU_REDIRECT_URI = process.env.FEISHU_REDIRECT_URI || 'https://smart-onboarding-frontend.loca.lt/feishu-callback';

// Configure Supabase Client for file uploads
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Use memory storage for multer since we'll upload directly to Supabase
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to protect routes
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// 1. Auth: Register
router.post('/auth/register', async (req, res) => {
  const { username, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name }
    });
    res.json({ id: user.id, username: user.username, name: user.name });
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// 2. Auth: Login
router.post('/auth/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// 2.5 Auth: Feishu Login Callback
router.post('/auth/feishu/callback', async (req: any, res: any) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  try {
    // 1. 获取 tenant_access_token
    const tokenRes = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    });
    const tenantAccessToken = tokenRes.data.tenant_access_token;

    if (!tenantAccessToken) {
      throw new Error('Failed to get tenant_access_token');
    }

    // 2. 使用 code 换取 user_access_token
    const userTokenRes = await axios.post('https://open.feishu.cn/open-apis/authen/v1/oidc/access_token', {
      grant_type: 'authorization_code',
      code: code
    }, {
      headers: {
        Authorization: `Bearer ${tenantAccessToken}`
      }
    });

    const userAccessToken = userTokenRes.data.data.access_token;
    
    // 3. 获取用户信息
    const userInfoRes = await axios.get('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    });

    const userInfo = userInfoRes.data.data;
    const feishuOpenId = userInfo.open_id;
    const feishuName = userInfo.name;

    // 4. 在我们自己的数据库中查找或创建用户
    let user = await prisma.user.findUnique({
      where: { feishuOpenId }
    });

    if (!user) {
      // 自动注册
      user = await prisma.user.create({
        data: {
          username: `fs_${feishuOpenId.substring(0, 8)}`,
          name: feishuName,
          feishuOpenId,
          role: 'employee' // 默认员工权限
        }
      });
    }

    // 5. 签发我们系统的 JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });

  } catch (err: any) {
    console.error('Feishu login error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Feishu login failed' });
  }
});

// 2.6 User: Update Job Role
  router.put('/user/role', authMiddleware, async (req: any, res: any) => {
    const { jobRole } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { jobRole }
      });
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update job role' });
    }
  });

  // 3. Courses: Get All
router.get('/courses', authMiddleware, async (req: any, res) => {
  const courses = await prisma.course.findMany({
    include: {
      materials: true,
      progresses: {
        where: { userId: req.user.id }
      }
    }
  });
  res.json(courses);
});

// 4. Courses: Get Single
router.get('/courses/:id', authMiddleware, async (req: any, res: any) => {
  const courseId = parseInt(req.params.id);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { 
      materials: true,
      progresses: {
        where: { userId: req.user.id }
      }
    }
  });
  res.json(course);
});

// 5. Courses: Update Progress
router.post('/courses/:id/progress', authMiddleware, async (req: any, res: any) => {
  const courseId = parseInt(req.params.id);
  const { materialId } = req.body;

  try {
    // 1. 获取该课程下的所有资料总数
    const totalMaterials = await prisma.material.count({
      where: { courseId }
    });

    if (totalMaterials === 0) {
      return res.status(400).json({ error: 'No materials in this course' });
    }

    // 2. 获取当前用户的进度记录
    let progressRecord = await prisma.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      }
    });

    let completedMaterials: number[] = [];
    if (progressRecord) {
      completedMaterials = JSON.parse(progressRecord.completedMaterials);
    }

    // 3. 如果当前资料尚未标记为完成，则添加进去
    if (!completedMaterials.includes(materialId)) {
      completedMaterials.push(materialId);
    }

    // 4. 重新计算百分比
    const progressPercentage = Math.round((completedMaterials.length / totalMaterials) * 100);
    const completed = progressPercentage >= 100;

    // 5. 更新或创建进度记录
    const result = await prisma.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId
        }
      },
      update: { 
        progress: progressPercentage, 
        completed,
        completedMaterials: JSON.stringify(completedMaterials)
      },
      create: { 
        userId: req.user.id, 
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

// Admin: Upload File (Directly to Supabase Storage)
router.post('/admin/upload', authMiddleware, adminMiddleware, upload.single('file'), async (req: any, res: any) => {
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

// Admin: Create Course
router.post('/admin/courses', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { title, description } = req.body;
  try {
    const course = await prisma.course.create({
      data: { title, description }
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Admin: Update Course
router.put('/admin/courses/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const courseId = parseInt(req.params.id);
  const { title, description } = req.body;
  try {
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description }
    });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Admin: Add Material to Course
router.post('/admin/courses/:id/materials', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const courseId = parseInt(req.params.id);
  const { title, type, url } = req.body;
  try {
    const material = await prisma.material.create({
      data: {
        title,
        type,
        url,
        courseId
      }
    });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add material' });
  }
});

// Admin: Delete Material
router.delete('/admin/materials/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const materialId = parseInt(req.params.id);
  try {
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Optional: Delete physical file if it's a local upload
    if (material.url.startsWith('http://localhost:3000/uploads/')) {
      const filename = material.url.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../uploads', filename);
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

// Admin: Delete Course
router.delete('/admin/courses/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const courseId = parseInt(req.params.id);
  try {
    // Delete related materials and progresses first due to foreign key constraints
    await prisma.material.deleteMany({ where: { courseId } });
    await prisma.courseProgress.deleteMany({ where: { courseId } });
    
    await prisma.course.delete({ where: { id: courseId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Admin: Get all exams (with questions for admin)
router.get('/admin/exams', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { questions: true }
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Admin: Create Exam
router.post('/admin/exams', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const { title, description } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: { title, description }
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Admin: Update Exam
router.put('/admin/exams/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const examId = parseInt(req.params.id);
  const { title, description } = req.body;
  try {
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: { title, description }
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

// Admin: Delete Exam
router.delete('/admin/exams/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const examId = parseInt(req.params.id);
  try {
    await prisma.question.deleteMany({ where: { examId } });
    await prisma.examResult.deleteMany({ where: { examId } });
    await prisma.exam.delete({ where: { id: examId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

// Admin: Add Question
router.post('/admin/exams/:id/questions', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const examId = parseInt(req.params.id);
  const { content, type, options, answer, score } = req.body;
  try {
    const question = await prisma.question.create({
      data: {
        examId,
        content,
        type,
        options: JSON.stringify(options),
        answer,
        score
      }
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Admin: Update Question
router.put('/admin/questions/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const questionId = parseInt(req.params.id);
  const { content, type, options, answer, score } = req.body;
  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        content,
        type,
        options: JSON.stringify(options),
        answer,
        score
      }
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Admin: Delete Question
router.delete('/admin/questions/:id', authMiddleware, adminMiddleware, async (req: any, res: any) => {
  const questionId = parseInt(req.params.id);
  try {
    await prisma.question.delete({ where: { id: questionId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// 6. Exams: Get All
router.get('/exams', authMiddleware, async (req: any, res) => {
  const exams = await prisma.exam.findMany();
  res.json(exams);
});

// 7. Exams: Get Single with Questions
router.get('/exams/:id', authMiddleware, async (req: any, res) => {
  const examId = parseInt(req.params.id);
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
          // Don't send answer to frontend!
        }
      }
    }
  });
  res.json(exam);
});

// 8. Exams: Submit Result
router.post('/exams/:id/submit', authMiddleware, async (req: any, res: any) => {
  const examId = parseInt(req.params.id);
  const { answers } = req.body; // { questionId: "answer", ... }

  try {
    const questions = await prisma.question.findMany({ where: { examId } });
    
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach(q => {
      maxScore += q.score;
      // 兼容前端传过来的 key 可能是 string 类型的 questionId
      const userAnswer = answers[q.id] || answers[q.id.toString()];
      if (userAnswer === q.answer) {
        totalScore += q.score;
      }
    });

    const passed = (totalScore / maxScore) >= 0.6; // 60% to pass

    const result = await prisma.examResult.create({
      data: {
        userId: req.user.id,
        examId,
        score: totalScore,
        passed
      }
    });

    res.json({ ...result, totalScore, maxScore });
  } catch (err) {
    console.error("Exam submit error:", err);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

export default router;
