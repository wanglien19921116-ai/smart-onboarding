import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    }
  });

  const employee = await prisma.user.upsert({
    where: { username: 'employee' },
    update: {},
    create: {
      username: 'employee',
      password: hashedPassword,
      name: 'New Employee',
      role: 'employee'
    }
  });

  const course = await prisma.course.create({
    data: {
      title: '公司介绍与企业文化',
      description: '了解公司的发展历程、核心价值观和未来愿景。',
      materials: {
        create: [
          {
            title: '企业文化手册',
            type: 'document',
            url: 'https://example.com/culture.pdf'
          },
          {
            title: 'CEO 迎新致辞',
            type: 'video',
            url: 'https://example.com/welcome.mp4'
          }
        ]
      }
    }
  });

  const exam = await prisma.exam.create({
    data: {
      title: '企业文化测试',
      description: '检验对公司文化的理解程度。',
      questions: {
        create: [
          {
            content: '公司的核心价值观是什么？',
            type: 'single_choice',
            options: JSON.stringify(['客户第一', '追求利润', '效率优先', '无为而治']),
            answer: '客户第一',
            score: 50
          },
          {
            content: '公司成立于哪一年？',
            type: 'single_choice',
            options: JSON.stringify(['2010', '2015', '2020', '2025']),
            answer: '2015',
            score: 50
          }
        ]
      }
    }
  });

  console.log('Seeded data successfully');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
