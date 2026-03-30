import { Router } from 'express';
import authRouter from './auth';
import courseRouter from './course';
import examRouter from './exam';
import adminRouter from './admin';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', authRouter);   // /user/role 路由也在 auth 模块中
router.use('/courses', courseRouter);
router.use('/exams', examRouter);
router.use('/admin', adminRouter);

export default router;
