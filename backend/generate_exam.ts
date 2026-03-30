import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Generating and inserting exam...');
  
  const exam = await prisma.exam.create({
    data: {
      title: '新员工入职综合测试（2026版）',
      description: '基于《入职指南》、《公司制度》、《核心业务》及《AI进化》课程的综合测试。满分100分。',
      questions: {
        create: [
          {
            content: '员工在申请报销出差产生的住宿费和交通费时，通常需要依据以下哪项制度？',
            type: 'single_choice',
            options: JSON.stringify(['考勤与休假管理制度', '差旅费管理办法', '招待费标准', '市内交通费管理办法']),
            answer: '差旅费管理办法',
            score: 20
          },
          {
            content: '以下哪份资料属于公司【核心业务】板块中，关于诉讼执行的实务指导？',
            type: 'single_choice',
            options: JSON.stringify(['新员工手册', '诉讼执行全流程实务手册', 'AI时代进化指南', '费用报销要点']),
            answer: '诉讼执行全流程实务手册',
            score: 20
          },
          {
            content: '根据现有的培训课程体系，新员工入职后需要学习了解哪些板块的内容？（多选）',
            type: 'multiple_choice',
            options: JSON.stringify(['入职指南', '公司制度', '核心业务', 'AI进化']),
            answer: JSON.stringify(['入职指南', '公司制度', '核心业务', 'AI进化']),
            score: 20
          },
          {
            content: '如果员工需要了解最新的AI工具以辅助日常工作提升效率，应该去哪个板块查阅《AI学习工具目录》？',
            type: 'single_choice',
            options: JSON.stringify(['入职指南', '公司制度', '核心业务', 'AI进化']),
            answer: 'AI进化',
            score: 20
          },
          {
            content: '《常用法律概念与环富案件实务操作》和《属地化诉讼流程图》是公司制度板块的内容。',
            type: 'boolean',
            options: JSON.stringify(['正确', '错误']),
            answer: '错误', // 它们属于核心业务板块
            score: 20
          }
        ]
      }
    }
  });

  console.log('Exam created successfully:', exam.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });