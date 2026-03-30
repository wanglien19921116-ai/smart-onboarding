<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage } from 'element-plus';
import { Loading, Warning } from '@element-plus/icons-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const store = useUserStore();

// 建议使用环境变量或与登录页保持一致的配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const loading = ref(true);
const errorMsg = ref('');

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    errorMsg.value = '未获取到授权码，登录失败';
    loading.value = false;
    setTimeout(() => router.push('/login'), 3000);
    return;
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/feishu/callback`, { code });
    store.setAuth(res.data.token, res.data.user);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (err: any) {
    errorMsg.value = err.response?.data?.error || '飞书登录失败，请稍后重试';
    ElMessage.error(errorMsg.value);
    setTimeout(() => router.push('/login'), 3000);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div v-if="loading" class="flex flex-col items-center">
      <el-icon class="is-loading text-4xl text-blue-500 mb-4"><Loading /></el-icon>
      <p class="text-gray-600">正在进行飞书授权登录，请稍候...</p>
    </div>
    <div v-else class="flex flex-col items-center">
      <el-icon class="text-4xl text-red-500 mb-4"><Warning /></el-icon>
      <p class="text-red-600">{{ errorMsg }}</p>
      <p class="text-gray-500 text-sm mt-2">即将返回登录页...</p>
    </div>
  </div>
</template>
