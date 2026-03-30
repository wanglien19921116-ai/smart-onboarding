import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script for Aiyu Intelligence V2.0...');

  // 1. Clear existing courses and exams to avoid duplicates during development
  console.log('Clearing old data...');
  await prisma.examResult.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.courseProgress.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.course.deleteMany({});

  console.log('Creating Courses for Category 1: 必修基础区 (入职适应期)');
  const course1 = await prisma.course.create({
    data: {
      title: '入职指南',
      description: '北京艾语智能科技有限公司新员工入职必读',
      category: '必修基础',
      isRequired: true,
      duration: 30,
      materials: {
        create: [
          { title: '新员工手册', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409637497-964863892.pdf' }
        ]
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: '公司制度',
      description: '公司核心管理制度与报销规范',
      category: '必修基础',
      isRequired: true,
      duration: 45,
      materials: {
        create: [
          { title: '考勤与休假管理制度', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409748273-345889638.pdf' },
          { title: '差旅费管理办法', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409795408-492809989.pdf' },
          { title: '费用报销要点', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409837410-240208758.pdf' },
          { title: '市内交通费管理办法', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409999743-714208153.pdf' },
          { title: '招待费标准', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774410062059-542832192.pdf' }
        ]
      }
    }
  });

  console.log('Creating Courses for Category 2: 个贷不良专区 (业务认知期)');
  const course3 = await prisma.course.create({
    data: {
      title: '个贷不良处置行业现状与监管政策',
      description: '了解金融机构不良资产现状及合规红线',
      category: '个贷不良',
      isRequired: true,
      duration: 45,
      materials: {
        create: [
          { title: '行业现状与合规指南', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409967149-294077718.pdf' }
        ]
      }
    }
  });

  const course4 = await prisma.course.create({
    data: {
      title: '公司分散诉讼核心模式与全流程详解',
      description: '从案件导入到执行回款的全链条SOP',
      category: '个贷不良',
      isRequired: true,
      duration: 60,
      materials: {
        create: [
          { title: '常用法律概念与环富案件实务操作', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774433417389-676874525.pdf' },
          { title: '属地化诉讼流程图', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774433598906-626014864.pdf' },
          { title: '诉讼执行全流程实务手册', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774433682347-565003588.pdf' }
        ]
      }
    }
  });

  console.log('Creating Courses for Category 3: 知产维权专区 (业务认知期)');
  const course5 = await prisma.course.create({
    data: {
      title: '知识产权维权业务全景介绍',
      description: '新业务板块的商业模式与获客逻辑',
      category: '知产维权',
      isRequired: true,
      duration: 40,
      materials: {
        create: [
          { title: '知产维权业务手册', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409637497-964863892.pdf' } // Placeholder URL
        ]
      }
    }
  });

  const course6 = await prisma.course.create({
    data: {
      title: '侵权取证与证据固定核心要点',
      description: '如何确保证据链的合法性与完整性',
      category: '知产维权',
      isRequired: true,
      duration: 45,
      materials: {
        create: [
          { title: '取证实操指南', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409637497-964863892.pdf' } // Placeholder URL
        ]
      }
    }
  });

  console.log('Creating Courses for Category 4: AI工具专区 (全员必修)');
  const course7 = await prisma.course.create({
    data: {
      title: '公司AI工具矩阵全景介绍',
      description: '掌握艾语智能自研AI工具的核心能力',
      category: 'AI工具',
      isRequired: true,
      duration: 30,
      materials: {
        create: [
          { title: 'AI学习工具目录', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774409879245-767940108.pdf' }
        ]
      }
    }
  });

  const course8 = await prisma.course.create({
    data: {
      title: '通用AI工具办公提效教程',
      description: '利用大模型撰写、总结、排版',
      category: 'AI工具',
      isRequired: false, // 选修
      duration: 45,
      materials: {
        create: [
          { title: 'AI时代进化指南', type: 'document', url: 'https://xkhtcnawagjejdehssja.supabase.co/storage/v1/object/public/smart-onboarding/1774410136047-7756024.pdf' }
        ]
      }
    }
  });

  console.log('Creating Exams (随堂测, 阶段考, 综合考)...');
  
  // 随堂测：关联课程4 (个贷全流程详解)
  await prisma.exam.create({
    data: {
      title: '《个贷分散诉讼全流程》随堂测',
      description: '完成课程后的即时检验',
      examType: '随堂测',
      relatedId: course4.id,
      questions: {
        create: [
          {
            content: '在分散诉讼模式中，批量立案阶段最核心的 AI 辅助工具主要用于？',
            type: 'single_choice',
            options: JSON.stringify(['生成起诉状', '寻找老赖', '催收打电话', '冻结银行卡']),
            answer: '生成起诉状',
            score: 34
          },
          {
            content: '属地化诉讼的核心优势是解决异地立案难和执行难的问题。',
            type: 'boolean',
            options: JSON.stringify(['正确', '错误']),
            answer: '正确',
            score: 33
          },
          {
            content: '执行立案后，法务人员需要跟进的常规动作包括？',
            type: 'multiple_choice',
            options: JSON.stringify(['跟进网络查控', '申请限制高消费', '申请纳入失信名单', '代替法官去抓人']),
            answer: JSON.stringify(['跟进网络查控', '申请限制高消费', '申请纳入失信名单']),
            score: 33
          }
        ]
      }
    }
  });

  // 阶段考：入职适应期 (Stage 1)
  await prisma.exam.create({
    data: {
      title: '入职适应期阶段考核',
      description: '检验对公司基本制度的掌握程度。满分100分，80分及格解锁下一阶段。',
      examType: '阶段考',
      relatedId: 1, // Stage 1
      questions: {
        create: [
          {
            content: '员工出差进行异地法院立案，市内交通费只需提供发票即可报销，无需注明行程起止点。',
            type: 'boolean',
            options: JSON.stringify(['正确', '错误']),
            answer: '错误',
            score: 20
          },
          {
            content: '员工在申请报销出差产生的住宿费和交通费时，通常需要依据以下哪项制度？',
            type: 'single_choice',
            options: JSON.stringify(['考勤与休假管理制度', '差旅费管理办法', '招待费标准', '市内交通费管理办法']),
            answer: '差旅费管理办法',
            score: 20
          },
          {
            content: '新员工试用期通常为几个月？（请根据新员工手册回答）',
            type: 'single_choice',
            options: JSON.stringify(['1个月', '3个月', '6个月', '无试用期']),
            answer: '3个月', // 假设
            score: 20
          },
          {
            content: '关于业务招待费，以下说法正确的是？',
            type: 'multiple_choice',
            options: JSON.stringify(['必须提前申请', '需符合岗位报销额度', '不需要提供发票', '超出部分自行承担']),
            answer: JSON.stringify(['必须提前申请', '需符合岗位报销额度', '超出部分自行承担']),
            score: 20
          },
          {
            content: '公司规定的核心工作时间是？',
            type: 'single_choice',
            options: JSON.stringify(['9:00-18:00', '9:30-18:30', '10:00-19:00', '弹性工作制']),
            answer: '9:30-18:30', // 假设
            score: 20
          }
        ]
      }
    }
  });

  // 综合考
  await prisma.exam.create({
    data: {
      title: '艾语智能新人转正综合大考（2026版）',
      description: '总分：100分 | 题型：单选题(20题x2分)+多选题(10题x3分)+判断题(10题x2分) | 考试时长：60分钟',
      examType: '综合考',
      questions: {
        create: [
          // 一、单项选择题
          { content: '环富律所属地化诉讼策略中，A 类管辖的定义是（）', options: JSON.stringify(['A. 约定法定都有管辖权', 'B. 约定无，法定有', 'C. 约定法定均无法院管辖', 'D. 约定固定仲裁委管辖']), answer: 'A. 约定法定都有管辖权', score: 2, type: 'single_choice' },
          { content: '公司固定班制的标准工作时间为（）', options: JSON.stringify(['A. 9:00-12:00，13:00-18:00', 'B. 9:30-12:00，13:00-18:30', 'C. 9:00-12:30，13:30-18:30', 'D. 9:30-12:30，13:30-19:00']), answer: 'B. 9:30-12:00，13:00-18:30', score: 2, type: 'single_choice' },
          { content: 'FlashGuard 采用的核心监测方式是（）', options: JSON.stringify(['A. 网页爬虫抓取公开信息', 'B. AI Agent 操控真实云手机真机巡检', 'C. 人工全网手动搜索', 'D. 平台接口直接调取数据']), answer: 'B. AI Agent 操控真实云手机真机巡检', score: 2, type: 'single_choice' },
          { content: '民事诉讼中，简易程序的审理时限为（）', options: JSON.stringify(['A. 6+6+X', 'B. 3+1', 'C. 2+1', 'D. 1 年']), answer: 'B. 3+1', score: 2, type: 'single_choice' },
          { content: '公司员工每迟到 1 次，工资扣减标准为（）', options: JSON.stringify(['A. 50 元', 'B. 80 元', 'C. 100 元', 'D. 200 元']), answer: 'C. 100 元', score: 2, type: 'single_choice' },
          { content: 'FlashGuard 对侵权内容的识别准确率可达（）', options: JSON.stringify(['A. 90%', 'B. 95%', 'C. 99.5%', 'D. 100%']), answer: 'C. 99.5%', score: 2, type: 'single_choice' },
          { content: '依据判决书申请执行的时间为收到判决书后（）', options: JSON.stringify(['A. 15 天', 'B. 25 天', 'C. 30 天', 'D. 6 个月']), answer: 'B. 25 天', score: 2, type: 'single_choice' },
          { content: '公司普通员工在北上广深地区出差，住宿费限额标准为（）', options: JSON.stringify(['A. 400 元 / 人天', 'B. 500 元 / 人天', 'C. 600 元 / 人天', 'D. 800 元 / 人天']), answer: 'B. 500 元 / 人天', score: 2, type: 'single_choice' },
          { content: 'FlashGuard 行业首创的效果量化指标是（）', options: JSON.stringify(['A. 侵权链接删除数', 'B. 侵权度', 'C. 投诉处理量', 'D. 立案笔数']), answer: 'B. 侵权度', score: 2, type: 'single_choice' },
          { content: '民事诉讼中，公告送达的唯一条件是（）', options: JSON.stringify(['A. 被告拒绝签收文书', 'B. 被告无法送达', 'C. 原告申请公告', 'D. 案件标的额过小']), answer: 'B. 被告无法送达', score: 2, type: 'single_choice' },
          { content: '公司员工主动辞职，试用期内需提前（）以书面形式提出申请', options: JSON.stringify(['A. 3 天', 'B. 7 天', 'C. 15 天', 'D. 30 天']), answer: 'A. 3 天', score: 2, type: 'single_choice' },
          { content: '为 FlashGuard 知识产权维权提供司法闭环支持的艾语自有律所是（）', options: JSON.stringify(['A. 金杜律所', 'B. 环富律所', 'C. 中伦律所', 'D. 锦天城律所']), answer: 'B. 环富律所', score: 2, type: 'single_choice' },
          { content: '民事诉讼执行中，银行账户的冻结时效为（）', options: JSON.stringify(['A. 1 年', 'B. 2 年', 'C. 3 年', 'D. 永久冻结']), answer: 'A. 1 年', score: 2, type: 'single_choice' },
          { content: '公司员工市内交通费报销中， 不在 报销范围内的是（）', options: JSON.stringify(['A. 因公外出公交车费', 'B. 约见客户的出租车费', 'C. 紧急事项出租车费', 'D. 因公外出地铁费']), answer: 'B. 约见客户的出租车费', score: 2, type: 'single_choice' },
          { content: 'FlashGuard 从发现侵权到启动打击的响应时间可压缩至（）', options: JSON.stringify(['A. <15 分钟', 'B. 1 小时内', 'C. 半天内', 'D. 1 天内']), answer: 'A. <15 分钟', score: 2, type: 'single_choice' },
          { content: '小额诉讼程序的核心特点是（）', options: JSON.stringify(['A. 可上诉，诉讼费全额', 'B. 一审终审，诉讼费减半甚至 25%', 'C. 审理法官 3 人，审限 3 个月', 'D. 仅适用于金融借款案件']), answer: 'B. 一审终审，诉讼费减半甚至 25%', score: 2, type: 'single_choice' },
          { content: '公司密薪制规定，员工严禁透露及打探他人薪资，违反者公司有权（）', options: JSON.stringify(['A. 记过处分', 'B. 扣罚绩效', 'C. 解除劳动合同', 'D. 警告处理']), answer: 'C. 解除劳动合同', score: 2, type: 'single_choice' },
          { content: 'FlashGuard 可实现 RPA 自动化批量立案，其覆盖的全国法院数量为（）', options: JSON.stringify(['A. 2000+', 'B. 3124+', 'C. 3500+', 'D. 4000+']), answer: 'B. 3124+', score: 2, type: 'single_choice' },
          { content: '民事诉讼中，调解书经双方当事人签收后，其效力（）', options: JSON.stringify(['A. 低于判决书', 'B. 与判决书同等', 'C. 无强制执行力', 'D. 需司法确认后生效']), answer: 'B. 与判决书同等', score: 2, type: 'single_choice' },
          { content: '公司出差人员的差旅费津贴定额包干标准为（）', options: JSON.stringify(['A. 50 元 / 天', 'B. 80 元 / 天', 'C. 100 元 / 天', 'D. 120 元 / 天']), answer: 'B. 80 元 / 天', score: 2, type: 'single_choice' },
          
          // 二、多项选择题
          { content: '环富律所属地化诉讼中，触达员的核心工作职责包括（）', options: JSON.stringify(['A. 与法官沟通推进立案、线上开庭申请', 'B. 接收法院传票、判决书等法律文书', 'C. 代表客户出庭参与庭审', 'D. 协调案件材料及律师出庭事宜']), answer: JSON.stringify(['A. 与法官沟通推进立案、线上开庭申请', 'B. 接收法院传票、判决书等法律文书', 'D. 协调案件材料及律师出庭事宜']), score: 3, type: 'multiple_choice' },
          { content: '公司员工可享受 全薪休假 的假期类型包括（）', options: JSON.stringify(['A. 年休假、婚假', 'B. 陪产假、哺乳假', 'C. 丧假、工伤假', 'D. 病假、事假']), answer: JSON.stringify(['A. 年休假、婚假', 'B. 陪产假、哺乳假']), score: 3, type: 'multiple_choice' },
          { content: 'FlashGuard 相较于传统版权维权服务商，核心技术优势体现在（）', options: JSON.stringify(['A. AI Agent 操控真实云手机，深入封闭 APP 巡检', 'B. 多模态视觉大模型，精准识别 AI 变体、洗稿等伪装内容', 'C. 仅依靠网页爬虫抓取公开网页信息', 'D. 全程真机操作，天然绕过平台反爬策略']), answer: JSON.stringify(['A. AI Agent 操控真实云手机，深入封闭 APP 巡检', 'B. 多模态视觉大模型，精准识别 AI 变体、洗稿等伪装内容', 'D. 全程真机操作，天然绕过平台反爬策略']), score: 3, type: 'multiple_choice' },
          { content: '民事诉讼中，执行阶段可对被执行人的哪些财产进行查、扣、冻操作（）', options: JSON.stringify(['A. 银行账户、支付宝 / 微信余额', 'B. 股票、公积金、分红型保险', 'C. 车辆等动产', 'D. 房产等不动产']), answer: JSON.stringify(['A. 银行账户、支付宝 / 微信余额', 'B. 股票、公积金、分红型保险', 'C. 车辆等动产', 'D. 房产等不动产']), score: 3, type: 'multiple_choice' },
          { content: '公司费用报销的核心时限要求包括（）', options: JSON.stringify(['A. 所有费用不允许跨年报销', 'B. 各项费用原则上在发生后 1 个月内报销', 'C. 差旅费需在出差结束后 1 个月内报销', 'D. 发票开具日期无限制，可随时报销']), answer: JSON.stringify(['A. 所有费用不允许跨年报销', 'B. 各项费用原则上在发生后 1 个月内报销', 'C. 差旅费需在出差结束后 1 个月内报销']), score: 3, type: 'multiple_choice' },
          { content: 'FlashGuard 的全链路维权闭环包含的核心环节有（）', options: JSON.stringify(['A. 全域监测、精准识别', 'B. 自动固证、平台投诉', 'C. 司法立案、诉讼执行', 'D. 律师函触达、315 工商举报']), answer: JSON.stringify(['A. 全域监测、精准识别', 'B. 自动固证、平台投诉', 'C. 司法立案、诉讼执行', 'D. 律师函触达、315 工商举报']), score: 3, type: 'multiple_choice' },
          { content: '环富律所属地化诉讼中，关于线上开庭的说法正确的有（）', options: JSON.stringify(['A. 极力争取线上开庭，需确认开庭方式和时间', 'B. 案件最多可指定 2 个代理人，更换授权需提交撤销授权通知书', 'C. 部分当事人同意线上开庭，可采取同意方线上、不同意方线下方式', 'D. 线上开庭无需向法院提交任何授权材料']), answer: JSON.stringify(['A. 极力争取线上开庭，需确认开庭方式和时间', 'B. 案件最多可指定 2 个代理人，更换授权需提交撤销授权通知书', 'C. 部分当事人同意线上开庭，可采取同意方线上、不同意方线下方式']), score: 3, type: 'multiple_choice' },
          { content: '公司员工出差招待费的报销标准及要求包括（）', options: JSON.stringify(['A. 普通情况人均 200 元 / 次', 'B. 与高管同行人均 300 元 / 次', 'C. 超额部分无需审批，可直接报销', 'D. 招待一餐需扣减差旅费津贴 40 元']), answer: JSON.stringify(['A. 普通情况人均 200 元 / 次', 'B. 与高管同行人均 300 元 / 次', 'D. 招待一餐需扣减差旅费津贴 40 元']), score: 3, type: 'multiple_choice' },
          { content: 'FlashGuard 打击盗版黑产的 “三多锁定” 策略，具体指锁定（）的恶意侵权者', options: JSON.stringify(['A. 多次侵权', 'B. 多账户操作', 'C. 多平台传播', 'D. 多金额涉案']), answer: JSON.stringify(['A. 多次侵权', 'B. 多账户操作', 'C. 多平台传播']), score: 3, type: 'multiple_choice' },
          { content: '公司员工行为规范中，关于办公纪律的正确要求有（）', options: JSON.stringify(['A. 工作时间不得上网聊天、玩游戏、看与工作无关的资料', 'B. 不得打听同事的考绩结果和薪酬收入', 'C. 接听外线电话需在 3 声内接起，先说 “您好！艾语智能有限公司”', 'D. 可随意携带公物离开公司，无需上级批准']), answer: JSON.stringify(['A. 工作时间不得上网聊天、玩游戏、看与工作无关的资料', 'B. 不得打听同事的考绩结果和薪酬收入', 'C. 接听外线电话需在 3 声内接起，先说 “您好！艾语智能有限公司”']), score: 3, type: 'multiple_choice' },

          // 三、判断题
          { content: '环富律所属地化诉讼策略中，不论合同约定管辖为何，均以案涉被告住所地为标准分散立案。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: '公司弹性班制员工上午打卡时间可在 9:30~10:00 之间，下午下班打卡可在 18:30~19:00 之间。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: 'FlashGuard 仅能监测公开网页信息，无法进入闲鱼、抖音等封闭 APP 内部开展巡检工作。', options: JSON.stringify(['对', '错']), answer: '错', score: 2, type: 'true_false' },
          { content: '民事诉讼中的禁反言原则，指庭前准备和庭审阶段中认可的事实可以随意推翻。', options: JSON.stringify(['对', '错']), answer: '错', score: 2, type: 'true_false' },
          { content: '公司员工连续旷工超 2 天（含），或一年内累计旷工达 5 天，公司将按严重违纪处理，解除劳动合同。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: 'FlashGuard 首创 “首月不见效全额退款” 服务承诺，以 “侵权度” 量化数据证明维权实际效果。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: '民事诉讼执行申请被驳回的原因 仅为 材料问题，如申请书事项错误、未提交生效证明等。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: '公司员工休病假无挂号单、病例等相关医疗证明的，按事假处理。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' },
          { content: 'FlashGuard 的维权处置手段仅包含平台投诉下架，无专业的司法诉讼立案能力。', options: JSON.stringify(['对', '错']), answer: '错', score: 2, type: 'true_false' },
          { content: '公司差旅费报销实行 “一事一报、一次一报” 原则，不得合并填写、化整为零。', options: JSON.stringify(['对', '错']), answer: '对', score: 2, type: 'true_false' }
        ]
      }
    }
  });

  console.log('Seed script executed successfully! All V2.0 data is ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });