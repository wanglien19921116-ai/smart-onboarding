<script setup lang="ts">
import { useUserStore } from '../../store';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();

const logout = () => {
  store.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <header class="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <div class="text-xl font-bold flex items-center gap-3">
        <img src="/logo.png" alt="Logo" class="h-6 object-contain" />
        管理员后台 - 艾语星球
      </div>
      <div class="flex items-center gap-4">
        <el-button type="primary" size="small" @click="router.push('/dashboard')">返回前台</el-button>
        <span>管理员: {{ store.user?.name }}</span>
        <el-button type="danger" size="small" @click="logout">退出</el-button>
      </div>
    </header>
    
    <div class="flex flex-grow">
      <!-- 侧边栏 -->
      <aside class="w-64 bg-white shadow-md">
        <el-menu
          default-active="/admin/courses"
          class="h-full border-none"
          router
        >
          <el-menu-item index="/admin/courses">
            <template #title>课程与资料管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/exams">
            <template #title>考试与题目管理</template>
          </el-menu-item>
        </el-menu>
      </aside>
      
      <!-- 主内容区 -->
      <main class="flex-grow p-6">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
