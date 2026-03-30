import { Router, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { AuthRequest, UpdateJobRoleBody } from '../types';
import { authMiddleware } from '../middleware';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// 飞书配置 —— 全部从环境变量读取，不再硬编码 fallback 值
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';

// ── 注册 ──────────────────────────────────────────────
router.post('/register', async (req: AuthRequest, res: Response) => {
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

// ── 登录 ──────────────────────────────────────────────
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, jobRole: user.jobRole } });
});

// ── 飞书 OAuth 回调 ───────────────────────────────────
router.post('/feishu/callback', async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  if (!FEISHU_APP_ID || !FEISHU_APP_SECRET) {
    return res.status(500).json({ error: 'Feishu credentials not configured' });
  }

  try {
    // 1. 获取 tenant_access_token
    const tokenRes = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    });
    const tenantAccessToken = tokenRes.data.tenant_access_token;
    if (!tenantAccessToken) throw new Error('Failed to get tenant_access_token');

    // 2. 使用 code 换取 user_access_token
    const userTokenRes = await axios.post('https://open.feishu.cn/open-apis/authen/v1/oidc/access_token', {
      grant_type: 'authorization_code',
      code
    }, {
      headers: { Authorization: `Bearer ${tenantAccessToken}` }
    });
    const userAccessToken = userTokenRes.data.data.access_token;

    // 3. 获取用户信息
    const userInfoRes = await axios.get('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: { Authorization: `Bearer ${userAccessToken}` }
    });
    const userInfo = userInfoRes.data.data;
    const feishuOpenId = userInfo.open_id;
    const feishuName = userInfo.name;

    // 4. 查找或自动注册
    let user = await prisma.user.findUnique({ where: { feishuOpenId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `fs_${feishuOpenId.substring(0, 8)}`,
          name: feishuName,
          feishuOpenId,
          role: 'employee'
        }
      });
    }

    // 5. 签发 JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, jobRole: user.jobRole } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Feishu login error:', message);
    res.status(500).json({ error: 'Feishu login failed' });
  }
});

// ── 更新岗位 ──────────────────────────────────────────
router.put('/role', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { jobRole } = req.body as UpdateJobRoleBody;
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { jobRole }
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update job role' });
  }
});

export default router;
