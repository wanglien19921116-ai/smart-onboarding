<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();
const store = useUserStore();

// 从环境变量读取后端地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// TODO: 替换为您在飞书后台创建的 App ID
const FEISHU_APP_ID = 'cli_a94b8df043f8dcc6';
const FEISHU_REDIRECT_URI = encodeURIComponent('https://shiny-daifuku-da41d6.netlify.app/feishu-callback');

const isLogin = ref(true);
const form = ref({
  username: '',
  password: '',
  name: ''
});

const feishuLogin = () => {
  const url = `https://open.feishu.cn/open-apis/authen/v1/index?redirect_uri=${FEISHU_REDIRECT_URI}&app_id=${FEISHU_APP_ID}`;
  window.location.href = url;
};

const submit = async () => {
  try {
    if (isLogin.value) {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: form.value.username,
        password: form.value.password
      });
      store.setAuth(res.data.token, res.data.user);
      ElMessage.success('登录成功');
      router.push('/');
    } else {
      await axios.post(`${API_BASE_URL}/auth/register`, form.value);
      ElMessage.success('注册成功，请登录');
      isLogin.value = true;
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '操作失败');
  }
};
</script>

<template>
  <div class="flex items-center justify-center h-full mt-20">
    <el-card class="w-96 shadow-lg" style="border-radius: 12px; border: 1px solid #F2F3F5;">
      <template #header>
        <div class="text-center pt-2 pb-2">
          <img src="/logo.png" alt="Logo" class="h-12 mx-auto object-contain mb-4" />
          <h2 class="text-2xl font-bold" style="color: #1F2937;">艾语星球</h2>
          <p class="text-gray-500 text-sm mt-2">{{ isLogin ? '欢迎回来，请登录账号' : '开启你的探索之旅' }}</p>
        </div>
      </template>
      <el-form :model="form" @keyup.enter="submit">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large"></el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin">
          <el-input v-model="form.name" placeholder="姓名" size="large"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large"></el-input>
        </el-form-item>
        <el-button type="primary" class="w-full" size="large" @click="submit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>

        <div class="mt-4 border-t pt-4">
          <el-button type="success" class="w-full" size="large" @click="feishuLogin">
            飞书一键登录
          </el-button>
        </div>

        <div class="text-center mt-4 text-sm text-gray-500">
          <span class="cursor-pointer hover:text-blue-500" @click="isLogin = !isLogin">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </span>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
