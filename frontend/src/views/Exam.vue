<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const exam = ref<any>(null);
const answers = ref<Record<number, string>>({});
const result = ref<any>(null);

const fetchExam = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/exams/${route.params.id}`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    exam.value = res.data;
  } catch (err) {
    ElMessage.error('获取考试失败');
    router.push('/');
  }
};

const submitExam = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/exams/${route.params.id}/submit`, 
      { answers: answers.value },
      { headers: { Authorization: `Bearer ${store.token}` } }
    );
    result.value = res.data;
    
    ElMessageBox.alert(
      `您的得分：${result.value.score} / ${result.value.maxScore}<br/>状态：${result.value.passed ? '✅ 通过' : '❌ 未通过'}`,
      '考试结果',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '返回大厅',
        callback: () => {
          router.push('/');
        }
      }
    );
  } catch (err) {
    ElMessage.error('提交失败');
  }
};

onMounted(() => {
  fetchExam();
});
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen" v-if="exam">
    <div class="mb-8">
      <div class="flex justify-between items-center mb-2">
        <h1 class="text-2xl font-bold" style="color: #1F2937;">{{ exam.title }}</h1>
        <el-button @click="router.push('/')" style="background: transparent; border: 1px solid #D5D8DF; color: #1F2937; border-radius: 8px;">放弃返回</el-button>
      </div>
      <p style="color: #4B5563;">{{ exam.description }}</p>
    </div>

    <div class="space-y-6">
      <div 
        v-for="(q, index) in exam.questions" 
        :key="q.id" 
        class="transition-shadow hover:shadow-lg" 
        style="background-color: #FFFFFF; border: 1px solid #F2F3F5; border-radius: 12px; padding: 24px;"
      >
        <div style="color: #1F2937; font-size: 16px; font-weight: bold;" class="mb-4">
          {{ Number(index) + 1 }}. {{ q.content }} <span class="text-sm font-normal" style="color: #86909C;">({{ q.score }}分)</span>
        </div>
        
        <div class="flex flex-col gap-3">
          <div 
            v-for="opt in JSON.parse(q.options)" 
            :key="opt"
            class="p-3 cursor-pointer flex items-center transition-colors"
            :style="answers[q.id] === opt 
              ? 'background-color: #E8F0FF; color: #165DFF; font-weight: bold; border: 1px solid #165DFF; border-radius: 8px;' 
              : 'background-color: #FFFFFF; color: #1F2937; border: 1px solid #E5E6EB; border-radius: 8px;'"
            @click="!result && (answers[q.id] = opt)"
          >
            <div class="w-4 h-4 rounded-full border mr-3 flex items-center justify-center" :style="answers[q.id] === opt ? 'border-color: #165DFF;' : 'border-color: #C9CDD4;'">
              <div v-if="answers[q.id] === opt" class="w-2 h-2 rounded-full" style="background-color: #165DFF;"></div>
            </div>
            {{ opt }}
          </div>
        </div>

        <!-- 答案解析区（提交后展示） -->
        <div v-if="result" class="mt-6" style="background-color: #F2F3F5; border-radius: 8px; padding: 16px;">
          <div class="font-bold mb-2 flex items-center gap-2">
            <span>结果：</span>
            <!-- 假设 q.answer 是正确答案，如果后端没返回可以不展示，或用一个通用的 -->
            <span v-if="answers[q.id] === q.answer" style="color: #00B42A;">回答正确</span>
            <span v-else style="color: #F53F3F;">回答错误</span>
          </div>
          <div style="color: #4B5563; font-size: 14px;">
            <p><strong>正确答案：</strong> {{ q.answer || '请参考后台解析' }}</p>
            <p v-if="q.explanation" class="mt-1"><strong>解析：</strong> {{ q.explanation }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-10 pb-12" v-if="!result">
      <el-button size="large" class="w-48 hover:opacity-90" @click="submitExam" style="background-color: #165DFF; color: #FFFFFF; border: none; border-radius: 8px; height: 40px; font-size: 16px;">交 卷</el-button>
    </div>
    <div class="text-center mt-10 pb-12" v-else>
      <el-button size="large" class="w-48 hover:opacity-90" @click="router.push('/')" style="background-color: #165DFF; color: #FFFFFF; border: none; border-radius: 8px; height: 40px; font-size: 16px;">返回大厅</el-button>
    </div>
  </div>
</template>
