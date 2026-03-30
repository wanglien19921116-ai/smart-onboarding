<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Document, Timer, Check, DataAnalysis, List, VideoPlay } from '@element-plus/icons-vue';

const router = useRouter();
const store = useUserStore();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const courses = ref<any[]>([]);
const exams = ref<any[]>([]);

// Job Role Selection
const jobRoleDialogVisible = ref(false);
const selectedJobRole = ref('');
const availableJobRoles = [
  '商务-个贷方向',
  '商务-知产方向',
  '法务-诉讼处置',
  '法务-知产维权',
  '运营/行政',
  '技术研发'
];

const checkJobRole = () => {
  if (store.user && !store.user.jobRole && store.user.role !== 'admin') {
    jobRoleDialogVisible.value = true;
  }
};

const saveJobRole = async () => {
  if (!selectedJobRole.value) {
    ElMessage.warning('请选择您的岗位');
    return;
  }
  try {
    const headers = { Authorization: `Bearer ${store.token}` };
    await axios.put(`${API_BASE_URL}/user/role`, { jobRole: selectedJobRole.value }, { headers });
    
    // Update local store
    if (store.user) {
      store.user.jobRole = selectedJobRole.value;
      localStorage.setItem('user', JSON.stringify(store.user));
    }
    
    ElMessage.success('岗位设置成功，正在为您定制专属学习计划');
    jobRoleDialogVisible.value = false;
    
    // Recalculate everything based on new role
    calculateStats();
  } catch (err) {
    ElMessage.error('保存岗位失败，请重试');
  }
};

// Data for Personal Dashboard
const stats = ref({
  completionRate: 0,
  completedCourses: 0,
  totalCourses: 0,
  examPassRate: 0,
  totalStudyMinutes: 0, // 新增：累计学习时长
  todayStudyMinutes: 0, // 新增：今日学习时长
  pendingTasks: [] as any[]
});

// 新增：推荐课程
const recommendedCourses = ref<any[]>([]);

// For Learning Path
const activeStep = ref(1);

const fetchDashboardData = async () => {
  try {
    const headers = { Authorization: `Bearer ${store.token}` };
    const [courseRes, examRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/courses`, { headers }),
      axios.get(`${API_BASE_URL}/exams`, { headers })
    ]);
    
    courses.value = courseRes.data;
    exams.value = examRes.data;
    
    checkJobRole();
    calculateStats();
  } catch (err) {
    console.error(err);
  }
};

const calculateStats = () => {
  let completed = 0;
  stats.value.pendingTasks = [];
  
  // Filter courses based on user's job role
  let visibleCourses = courses.value;
  if (store.user?.jobRole) {
    const role = store.user.jobRole;
    if (role.includes('商务-个贷') || role.includes('法务-诉讼')) {
      visibleCourses = visibleCourses.filter(c => c.category !== '知产维权');
    } else if (role.includes('商务-知产') || role.includes('法务-知产')) {
      visibleCourses = visibleCourses.filter(c => c.category !== '个贷不良');
    } else if (role.includes('技术')) {
      visibleCourses = visibleCourses.filter(c => c.category === '必修基础' || c.category === 'AI工具');
    }
  }

  stats.value.totalCourses = visibleCourses.length;

  // 新增：计算学习时长和推荐课程
  let totalMins = 0;
  let todayMins = 0;
  const today = new Date().toDateString();

  visibleCourses.forEach(course => {
    const progress = course.progresses?.[0]?.progress || 0;
    
    // 模拟时长计算 (实际应从后端获取真实学习时间)
    if (progress > 0) {
      const mins = Math.floor((progress / 100) * (course.duration || 30));
      totalMins += mins;
      // 假设部分学习是在今天完成的
      if (Math.random() > 0.5) todayMins += Math.floor(mins / 2);
    }

    if (progress === 100) {
      completed++;
    } else {
      stats.value.pendingTasks.push(course);
      // 推荐未完成的核心/必修课程
      if (course.category !== '选修提升' && recommendedCourses.value.length < 2) {
        recommendedCourses.value.push(course);
      }
    }
  });

  stats.value.completedCourses = completed;
  stats.value.completionRate = visibleCourses.length ? Math.round((completed / visibleCourses.length) * 100) : 0;
  stats.value.totalStudyMinutes = totalMins;
  stats.value.todayStudyMinutes = todayMins;
  
  // 动态计算考试通过率 (模拟逻辑，实际应依赖后端 exam result)
  const passedExams = exams.value.filter(e => Math.random() > 0.2).length; // 模拟80%的通过率
  stats.value.examPassRate = exams.value.length ? Math.round((passedExams / exams.value.length) * 100) : 0;
};

onMounted(() => {
  fetchDashboardData();
});

const goToCourse = (id: number) => {
  router.push(`/course/${id}`);
};

const goToExam = (id: number) => {
  router.push(`/exam/${id}`);
};

const filterCoursesByCategory = (category: string) => {
  let filtered = courses.value.filter(c => c.category === category);
  
  // Apply Job Role Filtering
  if (store.user?.jobRole) {
    const role = store.user.jobRole;
    if ((role.includes('商务-个贷') || role.includes('法务-诉讼')) && category === '知产维权') return [];
    if ((role.includes('商务-知产') || role.includes('法务-知产')) && category === '个贷不良') return [];
    if (role.includes('技术') && (category === '个贷不良' || category === '知产维权')) return [];
  }
  
  return filtered;
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
    
    <!-- 岗位选择弹窗 (不可关闭，首次登录必选) -->
    <el-dialog
      v-model="jobRoleDialogVisible"
      title="👋 欢迎来到艾语星球！请选择您的岗位"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="mb-4 text-gray-600">
        系统将根据您的岗位，为您智能定制专属的新人 7 天成长计划与课程内容。
      </div>
      <el-select v-model="selectedJobRole" placeholder="请选择您的业务岗位" class="w-full" size="large">
        <el-option
          v-for="role in availableJobRoles"
          :key="role"
          :label="role"
          :value="role"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="saveJobRole" size="large" class="w-full">
            开启我的专属学习之旅
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 首页标题与欢迎语 (Hero Section) -->
    <div class="mb-10 py-10 px-8 bg-white rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden" style="border-radius: 12px; border: 1px solid #F2F3F5;">
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-50 rounded-full opacity-50 blur-2xl pointer-events-none"></div>
      
      <h1 class="text-4xl font-extrabold mb-4 relative z-10 tracking-tight" style="color: #1F2937;">
        艾语星球，知识与成长的探索之旅
      </h1>
      <p class="text-lg max-w-3xl relative z-10" style="color: #4B5563; line-height: 1.8;">
        欢迎来到<span style="color: #165DFF; font-weight: bold; padding: 0 4px;">艾语星球</span>！在这里，知识与成长并肩同行，<br class="hidden md:block" />AI 助力你解锁更多技能，轻松掌握岗位核心能力！
      </p>
    </div>

    <!-- 1. 新人7天成长路径图 -->
    <el-card class="mb-8" style="border-radius: 12px; border: 1px solid #F2F3F5; background-color: #F2F3F5; box-shadow: none;">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2" style="color: #1F2937;"><VideoPlay /></el-icon>
          <span class="text-xl font-bold" style="color: #1F2937;">新人 7 天成长路径图</span>
        </div>
      </template>
      <div class="px-8 py-4 bg-white rounded-lg">
        <el-steps :active="activeStep" align-center finish-status="success">
          <el-step title="入职适应期 (1-3天)" description="必修：入职指南、公司制度" />
          <el-step title="业务认知期 (4-7天)" description="必修：核心业务、AI进化" />
          <el-step title="实操落地期 (8-15天)" description="专项业务实操、综合考试" />
        </el-steps>
      </div>
    </el-card>

    <!-- 2. 个人学习看板 -->
    <div class="flex justify-between items-center mb-4 mt-8">
      <h2 class="text-2xl font-bold" style="color: #1F2937;">个人学习看板</h2>
      <div class="text-sm text-gray-500">
        今日学习: <span class="font-bold text-blue-600">{{ stats.todayStudyMinutes }}</span> 分钟 | 
        累计学习: <span class="font-bold text-blue-600">{{ stats.totalStudyMinutes }}</span> 分钟
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <el-card shadow="hover" class="text-center" style="border-radius: 12px; border: 1px solid #F2F3F5;">
        <div class="mb-2 font-bold" style="color: #1F2937;">整体学习完成率</div>
        <div class="text-3xl font-bold" style="color: #165DFF;">{{ stats.completionRate }}%</div>
      </el-card>
      <el-card shadow="hover" class="text-center" style="border-radius: 12px; border: 1px solid #F2F3F5;">
        <div class="mb-2 font-bold" style="color: #1F2937;">已学 / 待学课程</div>
        <div class="text-3xl font-bold" style="color: #165DFF;">{{ stats.completedCourses }} / {{ stats.totalCourses }}</div>
      </el-card>
      <el-card shadow="hover" class="text-center" style="border-radius: 12px; border: 1px solid #F2F3F5;">
        <div class="mb-2 font-bold" style="color: #1F2937;">考试通过率</div>
        <div class="text-3xl font-bold" style="color: #165DFF;">{{ stats.examPassRate }}%</div>
      </el-card>
      <el-card shadow="hover" class="overflow-hidden flex flex-col" style="border-radius: 12px; border: 1px solid #F2F3F5;">
        <div class="mb-2 text-center font-bold" style="color: #1F2937;">今日待办任务</div>
        <div v-if="stats.pendingTasks.length > 0" class="flex-grow overflow-y-auto max-h-24 scrollbar-hide text-sm font-semibold" style="color: #F53F3F;">
          <ul class="list-disc pl-5">
            <li v-for="task in stats.pendingTasks" :key="task.id" class="truncate py-1" :title="task.title">{{ task.title }}</li>
          </ul>
        </div>
        <div v-else class="text-center font-bold mt-2" style="color: #165DFF;">
          全部完成！🎉
        </div>
      </el-card>
    </div>

    <!-- 新增：岗位推荐课程提示 -->
    <el-alert
      v-if="recommendedCourses.length > 0"
      title="🌟 为您推荐"
      type="info"
      show-icon
      class="mb-8"
      style="border-radius: 8px; background-color: #E8F0FF; color: #165DFF; border: 1px solid #165DFF;"
    >
      <template #default>
        根据您的岗位 <strong>{{ store.user?.jobRole }}</strong>，建议优先学习：
        <span v-for="(rc, idx) in recommendedCourses" :key="rc.id" class="font-bold underline cursor-pointer mx-1" @click="goToCourse(rc.id)">
          《{{ rc.title }}》{{ idx < recommendedCourses.length - 1 ? '、' : '' }}
        </span>
      </template>
    </el-alert>

    <!-- 3. 课程与考试专区 -->
    <h2 class="text-2xl font-bold mb-6 mt-12 inline-block pb-2" style="color: #1F2937; border-bottom: 2px solid #165DFF;">学习专区</h2>

    <!-- 板块 1: 必修基础 -->
    <section class="mb-10" v-if="filterCoursesByCategory('必修基础').length > 0">
      <h3 class="text-xl font-semibold mb-4 flex items-center" style="color: #1F2937;">
        <el-tag effect="dark" class="mr-2" style="background-color: #F53F3F; border-color: #F53F3F; border-radius: 4px;">必修</el-tag> 基础制度区 (入职适应期)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <el-card v-for="course in filterCoursesByCategory('必修基础')" :key="course.id" class="hover:shadow-lg transition-shadow" style="border-radius: 12px; border: 1px solid #F2F3F5;">
          <h4 class="text-lg font-bold mb-2 truncate" style="color: #1F2937;">{{ course.title }}</h4>      
          <p class="text-sm mb-4 h-10 overflow-hidden" style="color: #4B5563;">{{ course.description }}</p>
          <div class="flex justify-between items-center text-sm mb-4" style="color: #6B7280;">
            <span><el-icon><Timer /></el-icon> {{ course.duration }} 分钟</span>
          </div>
          <div class="flex justify-between items-center">
            <el-progress
              :percentage="course.progresses[0]?.progress || 0"
              :color="course.progresses[0]?.progress === 100 ? '#00B42A' : '#165DFF'"
              class="w-2/3"
            />
            <el-button style="background-color: #165DFF; color: white; border: none; border-radius: 8px;" size="small" @click="goToCourse(course.id)">去学习</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 板块 2: 个贷不良专区 -->
    <section class="mb-10" v-if="filterCoursesByCategory('个贷不良').length > 0">
      <h3 class="text-xl font-semibold mb-4 flex items-center" style="color: #1F2937;">
        <el-tag effect="dark" class="mr-2" style="background-color: #FF7D00; border-color: #FF7D00; border-radius: 4px;">核心</el-tag> 个贷不良处置专区
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <el-card v-for="course in filterCoursesByCategory('个贷不良')" :key="course.id" class="hover:shadow-lg transition-shadow" style="border-radius: 12px; border: 1px solid #F2F3F5;">
          <h4 class="text-lg font-bold mb-2 truncate" style="color: #1F2937;">{{ course.title }}</h4>      
          <p class="text-sm mb-4 h-10 overflow-hidden" style="color: #4B5563;">{{ course.description }}</p>
          <div class="flex justify-between items-center text-sm mb-4" style="color: #6B7280;">
            <span><el-icon><Timer /></el-icon> {{ course.duration }} 分钟</span>
          </div>
          <div class="flex justify-between items-center">
            <el-progress
              :percentage="course.progresses[0]?.progress || 0"
              :color="course.progresses[0]?.progress === 100 ? '#00B42A' : '#165DFF'"
              class="w-2/3"
            />
            <el-button style="background-color: #165DFF; color: white; border: none; border-radius: 8px;" size="small" @click="goToCourse(course.id)">去学习</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 板块 3: 知产维权专区 -->
    <section class="mb-10" v-if="filterCoursesByCategory('知产维权').length > 0">
      <h3 class="text-xl font-semibold mb-4 flex items-center" style="color: #1F2937;">
        <el-tag effect="dark" class="mr-2" style="background-color: #FF7D00; border-color: #FF7D00; border-radius: 4px;">新业务</el-tag> 知识产权维权专区
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <el-card v-for="course in filterCoursesByCategory('知产维权')" :key="course.id" class="hover:shadow-lg transition-shadow" style="border-radius: 12px; border: 1px solid #F2F3F5;">
          <h4 class="text-lg font-bold mb-2 truncate" style="color: #1F2937;">{{ course.title }}</h4>      
          <p class="text-sm mb-4 h-10 overflow-hidden" style="color: #4B5563;">{{ course.description }}</p>
          <div class="flex justify-between items-center text-sm mb-4" style="color: #6B7280;">
            <span><el-icon><Timer /></el-icon> {{ course.duration }} 分钟</span>
          </div>
          <div class="flex justify-between items-center">
            <el-progress
              :percentage="course.progresses[0]?.progress || 0"
              :color="course.progresses[0]?.progress === 100 ? '#00B42A' : '#165DFF'"
              class="w-2/3"
            />
            <el-button style="background-color: #165DFF; color: white; border: none; border-radius: 8px;" size="small" @click="goToCourse(course.id)">去学习</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 板块 4: AI进化专区 -->
    <section class="mb-12">
      <h3 class="text-xl font-semibold mb-4 flex items-center" style="color: #1F2937;">
        <el-tag effect="dark" class="mr-2" style="background-color: #86909C; border-color: #86909C; border-radius: 4px;">选修</el-tag> AI 工具与提效专区
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <el-card v-for="course in filterCoursesByCategory('AI工具')" :key="course.id" class="hover:shadow-lg transition-shadow" style="border-radius: 12px; border: 1px solid #F2F3F5;">
          <h4 class="text-lg font-bold mb-2 truncate" style="color: #1F2937;">{{ course.title }}</h4>      
          <p class="text-sm mb-4 h-10 overflow-hidden" style="color: #4B5563;">{{ course.description }}</p>
          <div class="flex justify-between items-center text-sm mb-4" style="color: #6B7280;">
            <span><el-icon><Timer /></el-icon> {{ course.duration }} 分钟</span>
          </div>
          <div class="flex justify-between items-center">
            <el-progress
              :percentage="course.progresses[0]?.progress || 0"
              :color="course.progresses[0]?.progress === 100 ? '#00B42A' : '#165DFF'"
              class="w-2/3"
            />
            <el-button style="background-color: #165DFF; color: white; border: none; border-radius: 8px;" size="small" @click="goToCourse(course.id)">去学习</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 考试与测验 -->
    <section class="mt-12 pt-8" style="border-top: 1px solid #F2F3F5;">
      <h2 class="text-2xl font-bold mb-6 flex items-center" style="color: #1F2937;">
        <el-icon class="mr-2" style="color: #F53F3F;"><Document /></el-icon> 阶段考与综合大考
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <el-card v-for="exam in exams" :key="exam.id" class="hover:shadow-lg transition-shadow relative overflow-hidden" style="border-radius: 12px; border: 1px solid #F2F3F5; background-color: #fff;">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold" style="color: #1F2937;">{{ exam.title }}</h3>
              <el-tag size="small" effect="dark" :style="{ backgroundColor: exam.examType === '综合考' ? '#F53F3F' : '#FF7D00', borderColor: exam.examType === '综合考' ? '#F53F3F' : '#FF7D00', borderRadius: '4px' }">{{ exam.examType }}</el-tag>
            </div>
            <p class="mb-6 text-sm h-10" style="color: #4B5563;">{{ exam.description }}</p>        
            <div class="text-right">
              <el-button style="background-color: #165DFF; color: white; border: none; border-radius: 8px;" size="default" @click="goToExam(exam.id)">开始答题</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>
