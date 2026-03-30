<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../store';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadProps } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import axios from 'axios';

const store = useUserStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const courses = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogType = ref<'createCourse' | 'editCourse' | 'addMaterial'>('createCourse');
const currentCourseId = ref<number | null>(null);

// 上传相关
  const uploadHeaders = { Authorization: `Bearer ${store.token}` };
  const uploadUrl = `${API_BASE_URL}/admin/upload`;
  const isUploading = ref(false);

  const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
    // 之前是本地拼接，现在直接使用 Supabase 返回的完整 publicUrl
    form.value.url = response.url;
    isUploading.value = false;
    ElMessage.success('文件上传成功');
  };

const handleUploadError: UploadProps['onError'] = (_err) => {
  isUploading.value = false;
  ElMessage.error('文件上传失败');
};

const beforeUpload: UploadProps['beforeUpload'] = (_file) => {
  isUploading.value = true;
  return true;
};

const form = ref({
  title: '',
  description: '',
  type: 'document',
  url: ''
});

const fetchCourses = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    courses.value = res.data;
  } catch (err) {
    ElMessage.error('获取课程列表失败');
  }
};

const openCreateCourse = () => {
  dialogType.value = 'createCourse';
  form.value = { title: '', description: '', type: 'document', url: '' };
  dialogVisible.value = true;
};

const openEditCourse = (course: any) => {
  dialogType.value = 'editCourse';
  currentCourseId.value = course.id;
  form.value = { title: course.title, description: course.description || '', type: 'document', url: '' };
  dialogVisible.value = true;
};

const openAddMaterial = (courseId: number) => {
  dialogType.value = 'addMaterial';
  currentCourseId.value = courseId;
  form.value = { title: '', description: '', type: 'document', url: '' };
  dialogVisible.value = true;
};

const submitForm = async () => {
  try {
    const headers = { Authorization: `Bearer ${store.token}` };
    if (dialogType.value === 'addMaterial' && currentCourseId.value) {
      await axios.post(`${API_BASE_URL}/admin/courses/${currentCourseId.value}/materials`, 
        { title: form.value.title, type: form.value.type, url: form.value.url },
        { headers }
      );
      ElMessage.success('资料添加成功');
    } else if (dialogType.value === 'editCourse' && currentCourseId.value) {
      await axios.put(`${API_BASE_URL}/admin/courses/${currentCourseId.value}`, 
        { title: form.value.title, description: form.value.description },
        { headers }
      );
      ElMessage.success('课程更新成功');
    } else {
      await axios.post(`${API_BASE_URL}/admin/courses`, 
        { title: form.value.title, description: form.value.description },
        { headers }
      );
      ElMessage.success('课程创建成功');
    }
    dialogVisible.value = false;
    fetchCourses();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};

const deleteCourse = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程及所有关联资料吗？此操作不可恢复。', '警告', { type: 'warning' });
    await axios.delete(`${API_BASE_URL}/admin/courses/${id}`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    ElMessage.success('删除成功');
    fetchCourses();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

const deleteMaterial = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该资料吗？', '警告', { type: 'warning' });
    await axios.delete(`${API_BASE_URL}/admin/materials/${id}`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    ElMessage.success('资料删除成功');
    fetchCourses();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('资料删除失败');
  }
};

onMounted(() => {
  fetchCourses();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">课程与资料管理</h2>
      <el-button type="primary" @click="openCreateCourse">新建课程</el-button>
    </div>

    <el-table :data="courses" border class="w-full shadow-sm rounded-lg overflow-hidden">
      <el-table-column type="expand">
        <template #default="props">
          <div class="p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-gray-700">课程资料列表</h4>
              <el-button size="small" type="success" @click="openAddMaterial(props.row.id)">添加资料</el-button>
            </div>
            <el-table :data="props.row.materials" size="small" border>
              <el-table-column prop="title" label="资料名称" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'video' ? 'warning' : 'info'">
                    {{ scope.row.type === 'video' ? '视频' : '文档' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="url" label="资源链接" show-overflow-tooltip />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="deleteMaterial(scope.row.id)" link>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="props.row.materials.length === 0" class="text-gray-400 text-center py-4">
              暂无资料，请点击右上角添加
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="课程名称" />
      <el-table-column prop="description" label="课程描述" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="200">
        <template #default="scope">
          {{ new Date(scope.row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditCourse(scope.row)" link>编辑</el-button>
          <el-button type="danger" size="small" @click="deleteCourse(scope.row.id)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 通用弹窗：创建课程 / 编辑课程 / 添加资料 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'addMaterial' ? '添加课程资料' : (dialogType === 'editCourse' ? '编辑课程' : '新建课程')"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="form.title" placeholder="请输入名称"></el-input>
        </el-form-item>
        
        <template v-if="dialogType !== 'addMaterial'">
          <el-form-item label="描述">
            <el-input type="textarea" v-model="form.description" placeholder="请输入课程描述"></el-input>
          </el-form-item>
        </template>
        
        <template v-else>
          <el-form-item label="资料类型" required>
            <el-radio-group v-model="form.type">
              <el-radio label="document">文档 (PDF/Word等)</el-radio>
              <el-radio label="video">视频 (MP4等)</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="资源上传">
            <el-upload
              class="w-full"
              drag
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽文件到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持本地文件上传，上传成功后会自动填入下方链接
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item label="资源链接" required>
            <el-input v-model="form.url" placeholder="http://..." :disabled="isUploading">
              <template #append v-if="isUploading">上传中...</template>
            </el-input>
            <div class="text-xs text-gray-400 mt-1">您可以上传本地文件，也可以直接手动输入外部资源链接。</div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
