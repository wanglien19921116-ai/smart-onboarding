import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const exam = await prisma.exam.create({
    data: {
      title: '商务新人入职结业考试',
      description: '基于公司制度、企业文化及AI工具实践的综合测试，贴合个贷不良资产处置业务。',
      questions: {
        create: [
          // 判断题
          { content: '新员工入职后，只要与部门主管口头请假即可，无需在系统中提交审批。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '错误', score: 2 },
          { content: '由于个贷不良资产催收工作性质特殊，外出拜访债务人产生的市内打车费可以无限制报销。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '错误', score: 2 },
          { content: '员工到一线城市进行资产尽调，其住宿报销标准高于三线城市。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '正确', score: 2 },
          { content: '出差期间，因业务需要宴请资方代表，招待费凭发票实报实销，无需提前申请预算。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '错误', score: 2 },
          { content: '非技术类商务同学不需要学习 AI 工具，这是技术研发部门的专属要求。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '错误', score: 2 },
          { content: '利用 AI 工具整理催收通话录音并生成摘要，可以有效提升工作效率。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '正确', score: 2 },
          { content: '公司的核心价值观包含在《公司简介》中，每位新人都应当熟知并践行。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '正确', score: 2 },
          { content: '出差乘坐高铁时，普通员工一律只能报销二等座，超出部分由个人承担（特殊审批除外）。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '正确', score: 2 },
          { content: '市内交通费报销时，必须提供正规的出租车发票或网约车行程单及发票。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '正确', score: 2 },
          { content: '《AI实践指南》主要指导员工如何开发大模型，而不是如何使用工具。', type: 'boolean', options: JSON.stringify(['正确', '错误']), answer: '错误', score: 2 },
          // 单选题
          { content: '关于《考勤管理制度》，下列说法正确的是？', type: 'single_choice', options: JSON.stringify(['迟到 5 分钟内不算迟到', '漏打卡每个月有无限次补签机会', '请假必须提前在系统中走完审批流程', '加班第二天可以直接晚来，不需要申请']), answer: '请假必须提前在系统中走完审批流程', score: 4 },
          { content: '在个贷不良资产处置中，商务人员去同城法院查档，应参考哪份制度进行报销？', type: 'single_choice', options: JSON.stringify(['《出差招待费标准》', '《报销制度（市内交通费）》', '《差旅费管理办法》', '《公司简介》']), answer: '《报销制度（市内交通费）》', score: 4 },
          { content: '员工跨省出差对债务人进行实地走访，住宿标准应参考？', type: 'single_choice', options: JSON.stringify(['部门主管口头承诺', '《差旅费管理办法》', '员工个人喜好', '当地最高档酒店标准']), answer: '《差旅费管理办法》', score: 4 },
          { content: '为了合规推进业务，业务人员招待外部合作律师，必须遵守？', type: 'single_choice', options: JSON.stringify(['《考勤管理制度》', '《出差招待费标准》', '《AI实践指南》', '无标准，看心情']), answer: '《出差招待费标准》', score: 4 },
          { content: '根据《非技术类同学Ai学习工具目录》，以下哪项是 AI 工具在商务工作中的常见应用？', type: 'single_choice', options: JSON.stringify(['替代人工外出催收', '自动冻结债务人银行卡', '快速整理会议纪要和长篇案卷', '直接代替法官下达判决']), answer: '快速整理会议纪要和长篇案卷', score: 4 },
          { content: '商务新人在了解公司发展历程时，首选的资料是？', type: 'single_choice', options: JSON.stringify(['《出差招待费标准》', '《考勤管理制度》', '《公司简介》', '《AI实践指南》']), answer: '《公司简介》', score: 4 },
          { content: '关于市内交通费报销，以下哪种凭证通常是不合规的？', type: 'single_choice', options: JSON.stringify(['滴滴出行发票+行程单', '出租车机打发票', '手写的收据', '地铁购票凭证']), answer: '手写的收据', score: 4 },
          { content: '如果出差实际发生的住宿费超出了《差旅费管理办法》规定的标准，通常的处理方式是？', type: 'single_choice', options: JSON.stringify(['全额报销', '超出部分个人承担（无特批情况下）', '找其他发票顶替', '拒绝出差']), answer: '超出部分个人承担（无特批情况下）', score: 4 },
          { content: '在个贷不良资产尽调中，面临大量繁杂的文本资料，员工可以借助什么来提升效率？', type: 'single_choice', options: JSON.stringify(['《报销制度（市内交通费）》', '纯手工逐字抄写', '《AI实践指南》中推荐的工具', '放弃尽调']), answer: '《AI实践指南》中推荐的工具', score: 4 },
          { content: '招待费报销通常需要提供哪些材料？', type: 'single_choice', options: JSON.stringify(['仅发票即可', '仅水单/小票即可', '发票、消费明细及招待事由/人员名单', '都不需要']), answer: '发票、消费明细及招待事由/人员名单', score: 4 },
          { content: '公司推行《AI实践指南》的主要目的是？', type: 'single_choice', options: JSON.stringify(['裁减员工', '让员工转行做程序员', '赋能业务，提升人效', '增加员工考核负担']), answer: '赋能业务，提升人效', score: 4 },
          { content: '以下哪种情况属于旷工？', type: 'single_choice', options: JSON.stringify(['提前请病假并获批', '未请假且全天未到岗', '因公外出且已报备', '法定节假日休息']), answer: '未请假且全天未到岗', score: 4 },
          { content: '关于出差审批，正确的流程是？', type: 'single_choice', options: JSON.stringify(['先买票出差，回来再补审批', '只要主管口头同意就可以直接去', '出发前在系统中提交出差申请并获批', '不需要审批']), answer: '出发前在系统中提交出差申请并获批', score: 4 },
          { content: '如果发现合适的 AI 工具不在《非技术类同学Ai学习工具目录》中，员工应该？', type: 'single_choice', options: JSON.stringify(['绝对禁止使用', '积极在团队内分享实践经验', '离职去别的公司用', '隐藏起来自己用']), answer: '积极在团队内分享实践经验', score: 4 },
          { content: '不良资产处置业务中，保持工作留痕非常重要。AI 工具可以帮助？', type: 'single_choice', options: JSON.stringify(['伪造录音', '自动生成合规的沟通记录摘要', '删除不利证据', '逃避监管']), answer: '自动生成合规的沟通记录摘要', score: 4 },
          { content: '出差招待客户时，如需赠送伴手礼，应？', type: 'single_choice', options: JSON.stringify(['随意购买名贵礼品', '严格遵守《出差招待费标准》中的礼品限额规定', '让客户自己买单', '找同事凑钱买']), answer: '严格遵守《出差招待费标准》中的礼品限额规定', score: 4 },
          { content: '员工日常办公的作息时间，应以哪份文件为准？', type: 'single_choice', options: JSON.stringify(['《公司简介》', '《考勤管理制度》', '《AI实践指南》', '《差旅费管理办法》']), answer: '《考勤管理制度》', score: 4 },
          { content: '去外地进行不良资产诉讼立案，产生的打车费属于？', type: 'single_choice', options: JSON.stringify(['市内交通费', '差旅费中的交通费用', '招待费', '办公费']), answer: '差旅费中的交通费用', score: 4 },
          { content: '学习《公司简介》对个贷不良资产处置业务人员的意义在于？', type: 'single_choice', options: JSON.stringify(['毫无意义', '了解公司背景，在与资方或债务人沟通时能更专业地介绍公司实力', '为了考试拿满分', '为了挑公司的毛病']), answer: '了解公司背景，在与资方或债务人沟通时能更专业地介绍公司实力', score: 4 },
          { content: '当面见债务人时，关于费用的支出，以下哪项绝对禁止？', type: 'single_choice', options: JSON.stringify(['按照标准报销前往的高铁费', '违规超标宴请债务人或私下利益输送', '报销市内的公交地铁费', '按照标准报销住宿费']), answer: '违规超标宴请债务人或私下利益输送', score: 4 }
        ]
      }
    }
  });

  console.log('Exam and questions created successfully:', exam.id);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
