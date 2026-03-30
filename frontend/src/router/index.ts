import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login },
    { path: '/feishu-callback', component: () => import('../views/FeishuCallback.vue') },
    { path: '/dashboard', component: Dashboard }, // Dashboard 保持同步加载，因为是核心入口
    { path: '/course/:id', component: () => import('../views/CourseDetail.vue') },
    { path: '/exam/:id', component: () => import('../views/Exam.vue') },
    { 
      path: '/admin', 
      component: () => import('../views/admin/AdminLayout.vue'),
      redirect: '/admin/courses',
      children: [
        { path: 'courses', component: () => import('../views/admin/Courses.vue') },
        { path: 'exams', component: () => import('../views/admin/Exams.vue') }
      ]
    },
  ]
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const publicPages = ['/login', '/feishu-callback'];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !token) {
    next('/login');
  } else if (to.path.startsWith('/admin') && user?.role !== 'admin') {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
