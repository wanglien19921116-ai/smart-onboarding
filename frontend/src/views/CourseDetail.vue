<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage } from 'element-plus';
import { Check, FullScreen, Document } from '@element-plus/icons-vue';
import axios from 'axios';
import VuePdfEmbed from 'vue-pdf-embed';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const course = ref<any>(null);
const currentMaterial = ref<any>(null);
const progress = ref(0);
const completedMaterials = ref<number[]>([]);

// 用于全屏的引用
const viewerRef = ref<HTMLElement | null>(null);

const toggleFullScreen = () => {
  if (!viewerRef.value) return;

  if (!document.fullscreenElement) {
    viewerRef.value.requestFullscreen().catch(err => {
      ElMessage.error(`全屏请求失败: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

const fetchCourse = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/courses/${route.params.id}`, {
      headers: { Authorization: `Bearer ${store.token}`, 'Bypass-Tunnel-Reminder': 'true' }
    });
    
    // 替换为后端的公网地址
    if (res.data && res.data.materials) {
      res.data.materials = res.data.materials.map((m: any) => {
        if (m.url.includes('http://localhost:3000') || m.url.includes('http://192.168.')) {
          m.url = m.url.replace(/http:\/\/[^:]+:3000/, 'https://smart-onboarding-backend.loca.lt');
        }
        return m;
      });
    }

    course.value = res.data;
    if (course.value.materials.length > 0) {
      currentMaterial.value = course.value.materials[0];
    }
    
    // 初始化进度数据
    if (course.value.progresses && course.value.progresses.length > 0) {
      progress.value = course.value.progresses[0].progress;
      completedMaterials.value = JSON.parse(course.value.progresses[0].completedMaterials || '[]');
    }
  } catch (err) {
    ElMessage.error('获取课程失败');
    router.push('/');
  }
};

const updateProgress = async () => {
  if (!currentMaterial.value) return;

  try {
    const res = await axios.post(`${API_BASE_URL}/courses/${route.params.id}/progress`, 
      { materialId: currentMaterial.value.id },
      { headers: { Authorization: `Bearer ${store.token}` } }
    );
    
    // 更新本地状态
    progress.value = res.data.progress;
    completedMaterials.value = JSON.parse(res.data.completedMaterials || '[]');

    if (progress.value === 100) {
      ElMessage.success('恭喜你完成了该课程！');
    } else {
      ElMessage.success('当前资料学习进度已记录');
    }
  } catch (err) {
    ElMessage.error('进度保存失败');
  }
};

onMounted(() => {
  fetchCourse();
});
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto" v-if="course">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold" style="color: #1F2937;">{{ course.title }}</h1>
      <el-button @click="router.push('/')" style="background: transparent; border: 1px solid #D5D8DF; color: #1F2937; border-radius: 8px;">返回大厅</el-button>
    </div>
    
    <div class="flex gap-6">
      <!-- 资料列表 -->
      <div class="w-1/3">
        <el-card class="h-full border-0" style="background-color: #F2F3F5; border-radius: 12px;">
          <template #header>
            <div class="font-bold text-lg" style="color: #1F2937;">课程目录</div>
          </template>
          <ul class="space-y-3">
            <li 
              v-for="mat in course.materials" 
              :key="mat.id"
              class="p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center"
              :style="currentMaterial?.id === mat.id ? 'background-color: #E8F0FF; color: #165DFF; font-weight: bold;' : 'color: #1F2937; background-color: #FFFFFF; border: 1px solid #E5E6EB;'"
              :class="currentMaterial?.id !== mat.id ? 'hover:shadow-sm' : ''"
              @click="currentMaterial = mat"
            >
              <span class="truncate pr-2">{{ mat.type === 'video' ? '🎬' : '📄' }} {{ mat.title }}</span>
              <el-icon v-if="completedMaterials.includes(mat.id)" style="color: #00B42A; font-size: 18px; font-weight: bold;"><Check /></el-icon>
            </li>
          </ul>
          
          <div class="mt-8 border-t pt-4" style="border-color: #D5D8DF;">
            <p class="mb-2 text-sm font-bold" style="color: #1F2937;">课程总进度</p>
            <el-progress 
              :percentage="progress" 
              :color="progress === 100 ? '#00B42A' : '#165DFF'" 
            />
          </div>
        </el-card>
      </div>

      <!-- 资料内容区 -->
      <div class="w-2/3">
        <el-card class="h-full min-h-[600px] flex flex-col" style="background-color: #FFFFFF; border: 1px solid #F2F3F5; border-radius: 12px;" body-style="padding: 24px;">
          <div v-if="currentMaterial" class="flex flex-col h-full w-full">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold truncate pr-4" style="color: #1F2937;">{{ currentMaterial.title }}</h2>
              <el-button @click="toggleFullScreen" :icon="FullScreen" style="background-color: #FFFFFF; color: #1F2937; border: 1px solid #D5D8DF; border-radius: 8px;">全屏查看</el-button>
            </div>
            
            <!-- Viewer Container with ref for fullscreen -->
            <div ref="viewerRef" class="flex-grow w-full border rounded-lg bg-black overflow-hidden relative" style="min-height: 500px; border-color: #F2F3F5;">
              <!-- Fullscreen exit button (only visible in fullscreen mode) -->
              <el-button 
                v-if="viewerRef && typeof document !== 'undefined' && document.fullscreenElement" 
                @click="toggleFullScreen" 
                class="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity" 
                circle 
                type="info"
              >
                X
              </el-button>
              <!-- 视频播放器 -->
              <video 
                v-if="currentMaterial.type === 'video' || currentMaterial.url.endsWith('.mp4')" 
                :src="currentMaterial.url" 
                controls 
                class="w-full h-full object-contain"
              >
                您的浏览器不支持视频播放。
              </video>
              
              <!-- PDF 预览 -->
              <div v-else-if="currentMaterial.url.endsWith('.pdf')" class="w-full h-full bg-white overflow-y-auto">
                <vue-pdf-embed :source="currentMaterial.url" />
              </div>

              <!-- 其他文档使用 iframe 预览 -->
              <iframe 
                v-else 
                :src="currentMaterial.url" 
                class="w-full h-full border-none bg-white"
                title="文档预览"
              ></iframe>
            </div>

            <div class="mt-6 flex justify-center gap-4">
              <el-button 
                size="large" 
                @click="updateProgress"
                :disabled="completedMaterials.includes(currentMaterial.id)"
                style="background-color: #165DFF; color: #FFFFFF; border: none; border-radius: 8px; min-width: 140px;"
              >
                {{ completedMaterials.includes(currentMaterial.id) ? '已学完' : '我已学习完毕' }}
              </el-button>
              <el-button 
                size="large" 
                style="background-color: #FFFFFF; color: #1F2937; border: 1px solid #D5D8DF; border-radius: 8px; min-width: 140px;"
              >
                疑问反馈
              </el-button>
            </div>
          </div>
          <div v-else class="text-gray-400 m-auto flex flex-col items-center justify-center h-full min-h-[500px]">
            <el-icon size="48" class="mb-4" style="color: #C9CDD4;"><Document /></el-icon>
            <p style="color: #4B5563;">请在左侧目录选择课程资料开始学习</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>
