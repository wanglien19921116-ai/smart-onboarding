import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExam() {
  try {
    console.log('Fetching exams...');
    const exams = await prisma.exam.findMany();
    console.log('Available exams:', exams.map(e => ({ id: e.id, title: e.title })));

    // Find the exam to update (using partial match since exact title might vary)
    const targetExam = exams.find(e => e.title.includes('入职适应期阶段考核'));
    
    let examId;
    
    if (targetExam) {
      console.log(`Found target exam: ${targetExam.title} (ID: ${targetExam.id})`);
      examId = targetExam.id;
      
      // Update the exam title and description if needed
      await prisma.exam.update({
        where: { id: examId },
        data: {
          title: '入职适应期阶段考核',
          description: '总分：100分 题型：单项选择题+判断题 适用：公司全员制度培训'
        }
      });
      
      // Delete existing questions
      console.log('Deleting existing questions...');
      await prisma.question.deleteMany({
        where: { examId: examId }
      });
    } else {
      console.log('Target exam not found, creating a new one...');
      const newExam = await prisma.exam.create({
        data: {
          title: '入职适应期阶段考核',
          description: '总分：100分 题型：单项选择题+判断题 适用：公司全员制度培训',
          examType: '阶段考'
        }
      });
      examId = newExam.id;
    }

    console.log('Adding new questions...');
    const questions = [
      // 一、单项选择题
      { content: '公司固定班制的工作时间为（）', options: JSON.stringify(['A. 上午9:00-12:00，下午13:00-18:00', 'B. 上午9:30-12:00，下午13:00-18:30', 'C. 上午9:30-12:00，下午13:30-18:30', 'D. 上午9:00-12:30，下午13:00-18:00']), answer: 'B. 上午9:30-12:00，下午13:00-18:30', score: 3, type: 'single_choice' },
      { content: '公司一类考勤人员的考勤要求为（）', options: JSON.stringify(['A. 固定班制打卡', 'B. 弹性班制打卡', 'C. 无需打卡', 'D. 仅上午打卡即可']), answer: 'C. 无需打卡', score: 3, type: 'single_choice' },
      { content: '员工每迟到1次，工资扣减标准为（）', options: JSON.stringify(['A. 50元', 'B. 80元', 'C. 100元', 'D. 200元']), answer: 'C. 100元', score: 3, type: 'single_choice' },
      { content: '员工当月未打卡次数在3次及以内的处理方式为（）', options: JSON.stringify(['A. 每次扣100元', 'B. 可申请补卡流程', 'C. 按旷工半天处理', 'D. 按事假1小时处理']), answer: 'B. 可申请补卡流程', score: 3, type: 'single_choice' },
      { content: '员工连续旷工超2天（含），公司将（）', options: JSON.stringify(['A. 记过处分', 'B. 扣罚当月工资20%', 'C. 解除劳动合同', 'D. 警告并罚款']), answer: 'C. 解除劳动合同', score: 3, type: 'single_choice' },
      { content: '累计工作满1年不满10年的员工，年休假天数为（）', options: JSON.stringify(['A. 3天', 'B. 5天', 'C. 10天', 'D. 15天']), answer: 'B. 5天', score: 3, type: 'single_choice' },
      { content: '公司女员工生育可享受的基础产假+延长生育假总计为（）', options: JSON.stringify(['A. 98天', 'B. 128天', 'C. 158天', 'D. 188天']), answer: 'C. 158天', score: 3, type: 'single_choice' },
      { content: '员工直系亲属去世，可享受的丧假天数为（）', options: JSON.stringify(['A. 3天', 'B. 5天', 'C. 7天', 'D. 10天']), answer: 'B. 5天', score: 3, type: 'single_choice' },
      { content: '员工试用期薪酬为转正薪酬的（）', options: JSON.stringify(['A. 70%', 'B. 80%', 'C. 90%', 'D. 100%']), answer: 'B. 80%', score: 3, type: 'single_choice' },
      { content: '员工主动辞职，试用期内需提前多少天以书面形式提出申请（）', options: JSON.stringify(['A. 3天', 'B. 7天', 'C. 15天', 'D. 30天']), answer: 'A. 3天', score: 3, type: 'single_choice' },
      { content: '公司员工市内交通费报销中，不在报销范围内的是（）', options: JSON.stringify(['A. 因公外出的公交车费', 'B. 因公外出的地铁费', 'C. 约见客户的出租车费', 'D. 紧急事项的出租车费']), answer: 'C. 约见客户的出租车费', score: 3, type: 'single_choice' },
      { content: '公司员工出差期间的招待费，普通情况人均标准为（）', options: JSON.stringify(['A. 100元/次', 'B. 200元/次', 'C. 300元/次', 'D. 500元/次']), answer: 'B. 200元/次', score: 3, type: 'single_choice' },
      { content: '普通员工在北上广深地区出差，住宿费限额标准为（）', options: JSON.stringify(['A. 400元/人天', 'B. 500元/人天', 'C. 600元/人天', 'D. 1000元/人天']), answer: 'B. 500元/人天', score: 3, type: 'single_choice' },
      { content: '公司员工出差的差旅费津贴定额包干标准为（）', options: JSON.stringify(['A. 50元/天', 'B. 80元/天', 'C. 100元/天', 'D. 120元/天']), answer: 'B. 80元/天', score: 3, type: 'single_choice' },
      { content: '员工出差招待客户一餐，需扣减的差旅费津贴为（）', options: JSON.stringify(['A. 20元', 'B. 40元', 'C. 60元', 'D. 80元']), answer: 'B. 40元', score: 3, type: 'single_choice' },
      { content: '公司所有费用的报销时限要求为（）', options: JSON.stringify(['A. 发生后15天内', 'B. 发生后1个月内', 'C. 发生后3个月内', 'D. 无明确时限，年底前即可']), answer: 'B. 发生后1个月内', score: 3, type: 'single_choice' },
      { content: '公司密薪制的要求为，员工严禁透露及打探他人薪资，违反者公司有权（）', options: JSON.stringify(['A. 记过处分', 'B. 扣罚绩效', 'C. 解除劳动合同', 'D. 警告处理']), answer: 'C. 解除劳动合同', score: 3, type: 'single_choice' },
      { content: '员工餐卡/门禁卡遗失，补办的成本费为（）', options: JSON.stringify(['A. 10元/张', 'B. 20元/张', 'C. 30元/张', 'D. 50元/张']), answer: 'B. 20元/张', score: 3, type: 'single_choice' },
      { content: '员工婚假的有效期限为（）', options: JSON.stringify(['A. 登记日起3个月内', 'B. 登记日起6个月内', 'C. 登记日起1年内', 'D. 登记日起2年内']), answer: 'C. 登记日起1年内', score: 3, type: 'single_choice' },
      { content: '公司保密义务的期限为（）', options: JSON.stringify(['A. 仅员工在职期间', 'B. 离职后1年内', 'C. 离职后2年内', 'D. 在职期间及离职后均需承担']), answer: 'D. 在职期间及离职后均需承担', score: 3, type: 'single_choice' },
      
      // 二、判断题
      { content: '公司弹性班制员工上午打卡时间可在9:30~10:00之间，下午下班打卡可在18:30~19:00之间。', options: JSON.stringify(['对', '错']), answer: '对', score: 4, type: 'true_false' },
      { content: '员工休病假无相关证明的，按事假处理。', options: JSON.stringify(['对', '错']), answer: '对', score: 4, type: 'true_false' },
      { content: '公司所有加班均可以发放加班费的形式进行补偿。', options: JSON.stringify(['对', '错']), answer: '错', score: 4, type: 'true_false' },
      { content: '员工产假遇法定节假日，可顺延相应天数。', options: JSON.stringify(['对', '错']), answer: '错', score: 4, type: 'true_false' },
      { content: '差旅费报销实行“一事一报、一次一报”原则，不得合并填写、化整为零。', options: JSON.stringify(['对', '错']), answer: '对', score: 4, type: 'true_false' },
      { content: '员工因公外出未提前办理手续，回公司后补办完成的，按旷工处理。', options: JSON.stringify(['对', '错']), answer: '错', score: 4, type: 'true_false' },
      { content: '公司职能部门员工薪酬结构为固定工资+绩效工资，绩效考核为年度1次。', options: JSON.stringify(['对', '错']), answer: '对', score: 4, type: 'true_false' },
      { content: '员工离职后3个月内提出复职要求，公司可受理并重新录用。', options: JSON.stringify(['对', '错']), answer: '错', score: 4, type: 'true_false' },
      { content: '报销交通费时，网约车发票金额与行程单金额不一致的，可正常报销。', options: JSON.stringify(['对', '错']), answer: '错', score: 4, type: 'true_false' },
      { content: '员工在工作时间内上网聊天、玩游戏，属于违反员工行为规范的行为。', options: JSON.stringify(['对', '错']), answer: '对', score: 4, type: 'true_false' }
    ];

    for (const q of questions) {
      await prisma.question.create({
        data: {
          ...q,
          examId: examId
        }
      });
    }

    console.log('Exam updated successfully!');
  } catch (error) {
    console.error('Error updating exam:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExam();