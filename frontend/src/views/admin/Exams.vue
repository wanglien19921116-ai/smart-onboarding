<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../store';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const store = useUserStore();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const exams = ref<any[]>([]);

// 弹窗状态
const dialogVisible = ref(false);
const dialogType = ref<'createExam' | 'editExam' | 'addQuestion' | 'editQuestion'>('createExam');
const currentExamId = ref<number | null>(null);
const currentQuestionId = ref<number | null>(null);

// 表单数据
const form = ref({
  title: '',
  description: '',
  // 题目相关
  content: '',
  type: 'single_choice',
  options: [''],
  answer: '',
  score: 10
});

const fetchExams = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/admin/exams`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    exams.value = res.data;
  } catch (err) {
    ElMessage.error('获取考试列表失败');
  }
};

// 考试操作
const openCreateExam = () => {
  dialogType.value = 'createExam';
  form.value = { ...form.value, title: '', description: '' };
  dialogVisible.value = true;
};

const openEditExam = (exam: any) => {
  dialogType.value = 'editExam';
  currentExamId.value = exam.id;
  form.value = { ...form.value, title: exam.title, description: exam.description || '' };
  dialogVisible.value = true;
};

const deleteExam = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该考试及所有关联题目吗？', '警告', { type: 'warning' });
    await axios.delete(`${API_BASE_URL}/admin/exams/${id}`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    ElMessage.success('删除成功');
    fetchExams();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败');
  }
};

// 题目操作
const openAddQuestion = (examId: number) => {
  dialogType.value = 'addQuestion';
  currentExamId.value = examId;
  form.value = { 
    ...form.value, 
    content: '', 
    type: 'single_choice', 
    options: ['', '', '', ''], 
    answer: '', 
    score: 4 
  };
  dialogVisible.value = true;
};

const openEditQuestion = (question: any) => {
  dialogType.value = 'editQuestion';
  currentQuestionId.value = question.id;
  form.value = {
    ...form.value,
    content: question.content,
    type: question.type,
    options: JSON.parse(question.options),
    answer: question.answer,
    score: question.score
  };
  dialogVisible.value = true;
};

const deleteQuestion = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该题目吗？', '提示', { type: 'warning' });
    await axios.delete(`${API_BASE_URL}/admin/questions/${id}`, {
      headers: { Authorization: `Bearer ${store.token}` }
    });
    ElMessage.success('删除题目成功');
    fetchExams();
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除题目失败');
  }
};

const submitForm = async () => {
  try {
    const headers = { Authorization: `Bearer ${store.token}` };
    if (dialogType.value === 'createExam') {
      await axios.post(`${API_BASE_URL}/admin/exams`, 
        { title: form.value.title, description: form.value.description },
        { headers }
      );
      ElMessage.success('考试创建成功');
    } else if (dialogType.value === 'editExam' && currentExamId.value) {
      await axios.put(`${API_BASE_URL}/admin/exams/${currentExamId.value}`, 
        { title: form.value.title, description: form.value.description },
        { headers }
      );
      ElMessage.success('考试更新成功');
    } else if (dialogType.value === 'addQuestion' && currentExamId.value) {
      // 过滤空选项
      const validOptions = form.value.type === 'boolean' ? ['正确', '错误'] : form.value.options.filter(o => o.trim() !== '');
      await axios.post(`${API_BASE_URL}/admin/exams/${currentExamId.value}/questions`, 
        { 
          content: form.value.content, 
          type: form.value.type, 
          options: validOptions,
          answer: form.value.answer,
          score: form.value.score
        },
        { headers }
      );
      ElMessage.success('题目添加成功');
    } else if (dialogType.value === 'editQuestion' && currentQuestionId.value) {
      const validOptions = form.value.type === 'boolean' ? ['正确', '错误'] : form.value.options.filter(o => o.trim() !== '');
      await axios.put(`${API_BASE_URL}/admin/questions/${currentQuestionId.value}`, 
        { 
          content: form.value.content, 
          type: form.value.type, 
          options: validOptions,
          answer: form.value.answer,
          score: form.value.score
        },
        { headers }
      );
      ElMessage.success('题目更新成功');
    }
    
    dialogVisible.value = false;
    fetchExams();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};

onMounted(() => {
  fetchExams();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">考试与题目管理</h2>
      <el-button type="primary" @click="openCreateExam">新建考试</el-button>
    </div>

    <el-table :data="exams" border class="w-full shadow-sm rounded-lg overflow-hidden">
      <el-table-column type="expand">
        <template #default="props">
          <div class="p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-gray-700">题目列表</h4>
              <el-button size="small" type="success" @click="openAddQuestion(props.row.id)">添加题目</el-button>
            </div>
            <el-table :data="props.row.questions" size="small" border>
              <el-table-column prop="content" label="题目内容" show-overflow-tooltip />
              <el-table-column prop="type" label="题型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.type === 'boolean' ? 'warning' : 'info'">
                    {{ scope.row.type === 'boolean' ? '判断题' : '单选题' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="answer" label="标准答案" width="150" show-overflow-tooltip />
              <el-table-column prop="score" label="分值" width="80" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="openEditQuestion(scope.row)" link>编辑</el-button>
                  <el-button type="danger" size="small" @click="deleteQuestion(scope.row.id)" link>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="props.row.questions.length === 0" class="text-gray-400 text-center py-4">
              暂无题目，请点击右上角添加
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="考试名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="题目数量" width="100">
        <template #default="scope">
          {{ scope.row.questions?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditExam(scope.row)" link>编辑</el-button>
          <el-button type="danger" size="small" @click="deleteExam(scope.row.id)" link>删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 综合弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="{
        'createExam': '新建考试',
        'editExam': '编辑考试',
        'addQuestion': '添加题目',
        'editQuestion': '编辑题目'
      }[dialogType]"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <!-- 考试表单 -->
        <template v-if="dialogType === 'createExam' || dialogType === 'editExam'">
          <el-form-item label="考试名称" required>
            <el-input v-model="form.title" placeholder="请输入考试名称"></el-input>
          </el-form-item>
          <el-form-item label="考试描述">
            <el-input type="textarea" v-model="form.description" placeholder="请输入描述"></el-input>
          </el-form-item>
        </template>

        <!-- 题目表单 -->
        <template v-else>
          <el-form-item label="题型" required>
            <el-radio-group v-model="form.type">
              <el-radio label="single_choice">单选题</el-radio>
              <el-radio label="boolean">判断题</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="题目内容" required>
            <el-input type="textarea" v-model="form.content" placeholder="请输入题目题干"></el-input>
          </el-form-item>
          <el-form-item label="分值" required>
            <el-input-number v-model="form.score" :min="1" :max="100"></el-input-number>
          </el-form-item>

          <!-- 单选题选项 -->
          <template v-if="form.type === 'single_choice'">
            <el-form-item label="选项">
              <div v-for="(_opt, index) in form.options" :key="index" class="flex gap-2 mb-2 w-full">
                <el-input v-model="form.options[index]" :placeholder="`选项 ${index + 1}`"></el-input>
                <el-button type="danger" circle icon="el-icon-delete" @click="form.options.splice(index, 1)">-</el-button>
              </div>
              <el-button type="primary" plain size="small" @click="form.options.push('')">+ 添加选项</el-button>
            </el-form-item>
            <el-form-item label="标准答案" required>
              <el-select v-model="form.answer" placeholder="请选择正确答案">
                <el-option 
                  v-for="(opt, index) in form.options.filter(o => o.trim() !== '')" 
                  :key="index" 
                  :label="opt" 
                  :value="opt"
                />
              </el-select>
            </el-form-item>
          </template>

          <!-- 判断题选项 -->
          <template v-else>
            <el-form-item label="标准答案" required>
              <el-radio-group v-model="form.answer">
                <el-radio label="正确">正确</el-radio>
                <el-radio label="错误">错误</el-radio>
              </el-radio-group>
            </el-form-item>
          </template>
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
