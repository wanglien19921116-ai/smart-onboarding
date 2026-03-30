import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users);
  
  if (users.length > 0) {
    // Make the first user an admin
    await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'admin' }
    });
    console.log(`Updated user ${users[0].name} to admin.`);
  }

  // Check if we have courses
  const courses = await prisma.course.findMany();
  console.log('Courses in DB:', courses.length);
  
  if (courses.length === 0) {
    console.log('Seeding courses and exams...');
    const course1 = await prisma.course.create({
      data: {
        title: '不良资产处置基础入门',
        description: '了解不良资产行业概况与基础法律知识',
        materials: {
          create: [
            {
              title: '行业概述与业务模式',
              type: 'video',
              url: 'https://www.w3schools.com/html/mov_bbb.mp4'
            },
            {
              title: '基础法律法规必读',
              type: 'document',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            }
          ]
        }
      }
    });

    const exam1 = await prisma.exam.create({
      data: {
        title: '不良资产基础知识测验',
        description: '测试对基础概念的理解',
        questions: {
          create: [
            {
              content: '以下哪项属于不良资产？',
              type: 'single_choice',
              options: JSON.stringify(['正常贷款', '逾期90天以上的贷款', '活期存款', '国债']),
              answer: '逾期90天以上的贷款',
              score: 50
            },
            {
              content: '不良资产处置的常见方式包括？',
              type: 'multiple_choice',
              options: JSON.stringify(['诉讼追偿', '债务重组', '资产转让', '核销']),
              answer: JSON.stringify(['诉讼追偿', '债务重组', '资产转让', '核销']),
              score: 50
            }
          ]
        }
      }
    });
    console.log('Database seeded successfully.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });