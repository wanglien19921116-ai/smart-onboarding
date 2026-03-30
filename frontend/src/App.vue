<script setup lang="ts">
import { useUserStore } from './store';
import { useRouter, useRoute } from 'vue-router';

const store = useUserStore();
const router = useRouter();
const route = useRoute();

const logout = () => {
  store.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航栏: 背景色深灰 #1F2937 -->
    <header v-if="store.token" class="bg-[#1F2937] text-white p-4 shadow-md">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/dashboard')">
          <img src="/logo.png" alt="Logo" class="h-8 object-contain" />
          <h1 class="text-xl font-bold tracking-wider">艾语星球</h1>
        </div>
        <div class="flex items-center gap-4">
          <!-- “进入后台”按钮：科技蓝渐变 #165DFF，圆角8px -->
          <el-button 
            v-if="store.user?.role === 'admin' && route.path !== '/admin'" 
            @click="router.push('/admin')"
            style="background: linear-gradient(90deg, #165DFF, #3b82f6); border: none; color: white; border-radius: 8px;"
          >
            进入后台
          </el-button>
          
          <el-button 
            v-if="route.path.startsWith('/admin')" 
            type="primary" 
            plain 
            @click="router.push('/dashboard')"
            style="border-radius: 8px;"
          >
            返回前台
          </el-button>
          
          <span class="text-sm text-gray-300">
            {{ store.user?.role === 'admin' ? '管理员' : '员工' }}：{{ store.user?.name }}
          </span>
          
          <!-- “退出”按钮：浅灰边框按钮，圆角8px -->
          <el-button 
            @click="logout" 
            style="background: transparent; border: 1px solid #F2F3F5; color: #F2F3F5; border-radius: 8px;"
            class="hover:bg-gray-700"
          >
            退出
          </el-button>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <router-view></router-view>
    </main>

    <!-- 页脚标语 -->
    <footer v-if="store.token" class="py-6 mt-auto">
      <div class="max-w-7xl mx-auto text-center text-gray-400 text-sm tracking-widest">
        艾语星球，与你共赴成长征程
      </div>
    </footer>
  </div>
</template>
