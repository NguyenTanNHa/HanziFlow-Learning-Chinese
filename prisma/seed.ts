// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding database...')

  // Clear existing data
  await prisma.userProgress.deleteMany()
  await prisma.flashcardReview.deleteMany()
  await prisma.speakingRecording.deleteMany()
  await prisma.writingSubmission.deleteMany()
  await prisma.quizResult.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.grammarPoint.deleteMany()
  await prisma.vocabulary.deleteMany()
  await prisma.listeningLesson.deleteMany()
  await prisma.speakingTopic.deleteMany()
  await prisma.readingLesson.deleteMany()
  await prisma.writingTask.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.roadmapStage.deleteMany()
  await prisma.roadmap.deleteMany()
  await prisma.userProfile.deleteMany()

  console.log('Existing data cleared.')

  // Hash default demo password
  // ⚠️  IMPORTANT (for buyers): Change this before going to production!
  // Default credentials: student@hanziflow.com / Admin@HanziFlow2025!
  //                      admin@hanziflow.com   / Admin@HanziFlow2025!
  const passwordHash = await bcrypt.hash('Admin@HanziFlow2025!', 12)

  // 1. Create Users
  const student = await prisma.userProfile.create({
    data: {
      email: 'student@hanziflow.com',
      passwordHash,
      name: 'Nguyen Van A',
      hskLevel: 1,
      learningGoal: 'communication',
      streak: 5,
      points: 150,
      role: 'user',
      placementCompleted: true,
    },
  })

  const admin = await prisma.userProfile.create({
    data: {
      email: 'admin@hanziflow.com',
      passwordHash,
      name: 'Teacher Wang',
      hskLevel: 4,
      learningGoal: 'business',
      streak: 12,
      points: 450,
      role: 'admin',
    },
  })

  console.log('Seeded users.')

  // 2. Create Roadmaps
  const hsk1_2_roadmap = await prisma.roadmap.create({
    data: {
      title: 'Lộ trình củng cố HSK 1-2',
      description: 'Dành cho người mới bắt đầu, nắm vững 300 từ vựng và ngữ pháp nền tảng.',
      level: 2,
    },
  })

  const hsk3_roadmap = await prisma.roadmap.create({
    data: {
      title: 'Lộ trình chinh phục HSK 3',
      description: 'Mở rộng từ vựng lên 600 từ, tự tin giao tiếp các chủ đề cơ bản hàng ngày.',
      level: 3,
    },
  })

  // 3. Create Roadmap Stages for HSK 1-2 Roadmap
  const stage1 = await prisma.roadmapStage.create({
    data: {
      roadmapId: hsk1_2_roadmap.id,
      title: 'Giai đoạn 1: Làm quen & Chào hỏi HSK 1',
      description: 'Làm quen với Pinyin, thanh điệu và chào hỏi cơ bản.',
      order: 1,
    },
  })

  const stage2 = await prisma.roadmapStage.create({
    data: {
      roadmapId: hsk1_2_roadmap.id,
      title: 'Giai đoạn 2: Gia đình & Đời sống HSK 1',
      description: 'Học cách giới thiệu bản thân và các thành viên trong gia đình.',
      order: 2,
    },
  })

  const stage3 = await prisma.roadmapStage.create({
    data: {
      roadmapId: hsk1_2_roadmap.id,
      title: 'Giai đoạn 3: Cuộc sống & Thời tiết HSK 2',
      description: 'Nâng cao khả năng giao tiếp mô tả thời tiết, sức khỏe.',
      order: 3,
    },
  })

  console.log('Seeded roadmaps and stages.')

  // 4. Create Lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      stageId: stage1.id,
      title: 'Bài 1: Bạn khỏe không? (你好吗？)',
      description: 'Học cách chào hỏi cơ bản và giới thiệu đại từ nhân xưng.',
      order: 1,
      level: 1,
    },
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      stageId: stage2.id,
      title: 'Bài 2: Gia đình của tôi (我的家)',
      description: 'Học cách giới thiệu các thành viên trong gia đình và hỏi han.',
      order: 1,
      level: 1,
    },
  })

  const lesson3 = await prisma.lesson.create({
    data: {
      stageId: stage3.id,
      title: 'Bài 3: Hôm nay trời nắng đẹp (今天天气很好)',
      description: 'Cách mô tả thời tiết nắng mưa, sức khỏe cơ thể và cảm giác.',
      order: 1,
      level: 2,
    },
  })

  const lesson4 = await prisma.lesson.create({
    data: {
      stageId: stage3.id,
      title: 'Bài 4: Sở thích của tôi là du lịch (我的爱好是旅游)',
      description: 'Học về các hoạt động giải trí: hát, nhảy múa, chạy bộ, du lịch.',
      order: 2,
      level: 2,
    },
  })

  const lesson5 = await prisma.lesson.create({
    data: {
      stageId: stage3.id,
      title: 'Bài 5: Mua đồng hồ (买手表)',
      description: 'Luyện giao tiếp khi đi mua sắm, so sánh đắt rẻ, đồ vật.',
      order: 3,
      level: 2,
    },
  })

  console.log('Seeded lessons.')

  // 5. Seed Vocabulary (20 HSK 1, 20 HSK 2)
  const hsk1Vocabs = [
    { character: '我', pinyin: 'wǒ', meaningVi: 'Tôi, tớ, mình', meaningEn: 'I, me', exampleZh: '我是学生。', exampleVi: 'Tôi là học sinh.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '你', pinyin: 'nǐ', meaningVi: 'Bạn, anh, chị', meaningEn: 'you', exampleZh: '你好吗？', exampleVi: 'Bạn khỏe không?', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '他', pinyin: 'tā', meaningVi: 'Anh ấy, cậu ấy', meaningEn: 'he, him', exampleZh: '他是我的老师。', exampleVi: 'Anh ấy là giáo viên của tôi.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '她', pinyin: 'tā', meaningVi: 'Cô ấy, chị ấy', meaningEn: 'she, her', exampleZh: '她很漂亮。', exampleVi: 'Cô ấy rất đẹp.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '我们', pinyin: 'wǒmen', meaningVi: 'Chúng tôi, chúng ta', meaningEn: 'we, us', exampleZh: '我们都是留学生。', exampleVi: 'Chúng tôi đều là du học sinh.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '是', pinyin: 'shì', meaningVi: 'Là, đúng', meaningEn: 'to be, yes', exampleZh: '他是医生。', exampleVi: 'Anh ấy là bác sĩ.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '老师', pinyin: 'lǎoshī', meaningVi: 'Giáo viên, thầy cô', meaningEn: 'teacher', exampleZh: '王老师您好！', exampleVi: 'Em chào thầy Vương!', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '学生', pinyin: 'xuéshēng', meaningVi: 'Học sinh, sinh viên', meaningEn: 'student', exampleZh: '他是学校的学生。', exampleVi: 'Cậu ấy là học sinh của trường.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '不', pinyin: 'bù', meaningVi: 'Không (phủ định)', meaningEn: 'not, no', exampleZh: '我不是中国人。', exampleVi: 'Tôi không phải là người Trung Quốc.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    { character: '好', pinyin: 'hǎo', meaningVi: 'Tốt, khỏe, ngon', meaningEn: 'good, well', exampleZh: '今天天气很好。', exampleVi: 'Hôm nay thời tiết rất tốt.', topic: 'study', hskLevel: 1, lessonId: lesson1.id },
    
    { character: '爸爸', pinyin: 'bàba', meaningVi: 'Bố, cha', meaningEn: 'father', exampleZh: '我爸爸工作很忙。', exampleVi: 'Bố tôi công việc rất bận.', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '妈妈', pinyin: 'māma', meaningVi: 'Mẹ', meaningEn: 'mother', exampleZh: '我爱我妈妈。', exampleVi: 'Tôi yêu mẹ tôi.', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '家', pinyin: 'jiā', meaningVi: 'Nhà, gia đình', meaningEn: 'home, family', exampleZh: '我家有三口人。', exampleVi: 'Nhà tôi có ba người.', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '谢谢', pinyin: 'xièxie', meaningVi: 'Cảm ơn', meaningEn: 'thank you', exampleZh: '谢谢你的礼物！', exampleVi: 'Cảm ơn món quà của bạn!', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '再见', pinyin: 'zàijiàn', meaningVi: 'Tạm biệt', meaningEn: 'goodbye', exampleZh: '老师，再见！', exampleVi: 'Em chào thầy, tạm biệt thầy!', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '有', pinyin: 'yǒu', meaningVi: 'Có', meaningEn: 'to have', exampleZh: '我有一本书。', exampleVi: 'Tôi có một cuốn sách.', topic: 'family', hskLevel: 1, lessonId: lesson2.id },
    { character: '医生', pinyin: 'yīshēng', meaningVi: 'Bác sĩ', meaningEn: 'doctor', exampleZh: '他在医院做医生。', exampleVi: 'Anh ấy làm bác sĩ ở bệnh viện.', topic: 'work', hskLevel: 1, lessonId: lesson2.id },
    { character: '学校', pinyin: 'xuéxiào', meaningVi: 'Trường học', meaningEn: 'school', exampleZh: '我们的学校很大。', exampleVi: 'Trường học của chúng tôi rất lớn.', topic: 'study', hskLevel: 1, lessonId: lesson2.id },
    { character: '苹果', pinyin: 'píngguǒ', meaningVi: 'Quả táo', meaningEn: 'apple', exampleZh: '我喜欢吃苹果。', exampleVi: 'Tôi thích ăn táo.', topic: 'food', hskLevel: 1, lessonId: lesson2.id },
    { character: '水', pinyin: 'shuǐ', meaningVi: 'Nước', meaningEn: 'water', exampleZh: '请喝水。', exampleVi: 'Xin mời uống nước.', topic: 'food', hskLevel: 1, lessonId: lesson2.id },
  ]

  const hsk2Vocabs = [
    { character: '生病', pinyin: 'shēngbìng', meaningVi: 'Ốm, bị bệnh', meaningEn: 'to fall ill', exampleZh: '他生病了，没去上课。', exampleVi: 'Anh ấy ốm rồi, không đi lên lớp.', topic: 'health', hskLevel: 2, lessonId: lesson3.id },
    { character: '药', pinyin: 'yào', meaningVi: 'Thuốc', meaningEn: 'medicine', exampleZh: '吃药了吗？感觉好点吗？', exampleVi: 'Uống thuốc chưa? Cảm thấy đỡ hơn chút nào không?', topic: 'health', hskLevel: 2, lessonId: lesson3.id },
    { character: '身体', pinyin: 'shēntǐ', meaningVi: 'Cơ thể, sức khỏe', meaningEn: 'body, health', exampleZh: '你要多运动，身体才会好。', exampleVi: 'Bạn phải vận động nhiều thì sức khỏe mới tốt.', topic: 'health', hskLevel: 2, lessonId: lesson3.id },
    { character: '晴', pinyin: 'qíng', meaningVi: 'Nắng, quang đãng', meaningEn: 'sunny', exampleZh: '今天是晴天。', exampleVi: 'Hôm nay là ngày nắng.', topic: 'travel', hskLevel: 2, lessonId: lesson3.id },
    { character: '阴', pinyin: 'yīn', meaningVi: 'Râm, âm u', meaningEn: 'cloudy', exampleZh: '阴天不冷也不热。', exampleVi: 'Trời nhiều mây không lạnh cũng không nóng.', topic: 'travel', hskLevel: 2, lessonId: lesson3.id },
    { character: '雪', pinyin: 'xuě', meaningVi: 'Tuyết', meaningEn: 'snow', exampleZh: '昨晚下雪了。', exampleVi: 'Tối qua tuyết rơi rồi.', topic: 'travel', hskLevel: 2, lessonId: lesson3.id },
    { character: '零', pinyin: 'líng', meaningVi: 'Số 0', meaningEn: 'zero', exampleZh: '今天气温是零下五度。', exampleVi: 'Nhiệt độ hôm nay là âm 5 độ.', topic: 'travel', hskLevel: 2, lessonId: lesson3.id },

    { character: '咖啡', pinyin: 'kāfēi', meaningVi: 'Cà phê', meaningEn: 'coffee', exampleZh: '你喜欢喝茶还是喝咖啡？', exampleVi: 'Bạn thích uống trà hay uống cà phê?', topic: 'food', hskLevel: 2, lessonId: lesson4.id },
    { character: '跑步', pinyin: 'pǎobù', meaningVi: 'Chạy bộ', meaningEn: 'running', exampleZh: '我每天早上跑步。', exampleVi: 'Tôi chạy bộ mỗi sáng.', topic: 'health', hskLevel: 2, lessonId: lesson4.id },
    { character: '唱歌', pinyin: 'chànggē', meaningVi: 'Hát', meaningEn: 'to sing', exampleZh: '她在房间里唱歌。', exampleVi: 'Cô ấy đang hát ở trong phòng.', topic: 'entertainment', hskLevel: 2, lessonId: lesson4.id },
    { character: '跳舞', pinyin: 'tiàowǔ', meaningVi: 'Nhảy múa', meaningEn: 'to dance', exampleZh: '他们正在跳舞。', exampleVi: 'Họ đang nhảy múa.', topic: 'entertainment', hskLevel: 2, lessonId: lesson4.id },
    { character: '旅游', pinyin: 'lǚyóu', meaningVi: 'Du lịch', meaningEn: 'to travel', exampleZh: '今年夏天我想去中国旅游。', exampleVi: 'Mùa hè năm nay tôi muốn đi du lịch Trung Quốc.', topic: 'travel', hskLevel: 2, lessonId: lesson4.id },
    { character: '机场', pinyin: 'jīchǎng', meaningVi: 'Sân bay', meaningEn: 'airport', exampleZh: '我去机场送朋友。', exampleVi: 'Tôi đi sân bay tiễn bạn.', topic: 'travel', hskLevel: 2, lessonId: lesson4.id },

    { character: '手表', pinyin: 'shǒubiǎo', meaningVi: 'Đồng hồ đeo tay', meaningEn: 'watch', exampleZh: '这块手表太贵了。', exampleVi: 'Chiếc đồng hồ này đắt quá.', topic: 'shopping', hskLevel: 2, lessonId: lesson5.id },
    { character: '房间', pinyin: 'fángjiān', meaningVi: 'Phòng, căn phòng', meaningEn: 'room', exampleZh: '这是我的房间。', exampleVi: 'Đây là căn phòng của tôi.', topic: 'family', hskLevel: 2, lessonId: lesson5.id },
    { character: '牛奶', pinyin: 'niúnǎi', meaningVi: 'Sữa bò', meaningEn: 'milk', exampleZh: '喝一杯牛奶对身体好。', exampleVi: 'Uống một ly sữa tốt cho cơ thể.', topic: 'food', hskLevel: 2, lessonId: lesson5.id },
    { character: '报纸', pinyin: 'bàozhǐ', meaningVi: 'Báo giấy', meaningEn: 'newspaper', exampleZh: '我爸爸喜欢看报纸。', exampleVi: 'Bố tôi thích đọc báo.', topic: 'study', hskLevel: 2, lessonId: lesson5.id },
    { character: '便宜', pinyin: 'piányi', meaningVi: 'Rẻ', meaningEn: 'cheap', exampleZh: '苹果很便宜，我们买一点吧。', exampleVi: 'Táo rất rẻ, chúng ta mua một ít đi.', topic: 'shopping', hskLevel: 2, lessonId: lesson5.id },
    { character: '贵', pinyin: 'guì', meaningVi: 'Đắt, quý', meaningEn: 'expensive', exampleZh: '这件衣服太贵了。', exampleVi: 'Chiếc áo này đắt quá.', topic: 'shopping', hskLevel: 2, lessonId: lesson5.id },
    { character: '眼睛', pinyin: 'yǎnjing', meaningVi: 'Mắt, đôi mắt', meaningEn: 'eye', exampleZh: '她的眼睛很大。', exampleVi: 'Đôi mắt của cô ấy rất to.', topic: 'health', hskLevel: 2, lessonId: lesson5.id },
  ]

  for (const v of [...hsk1Vocabs, ...hsk2Vocabs]) {
    await prisma.vocabulary.create({ data: v })
  }

  console.log('Seeded vocabulary.')

  // 6. Seed Grammar Points (10 points)
  const grammarPoints = [
    {
      title: 'Trợ từ sở hữu 的 (de)',
      formula: 'N/Adj/Pron + 的 + Danh từ',
      explanationVi: 'Dùng để nối định ngữ và trung tâm ngữ, biểu thị quan hệ sở hữu hoặc bổ nghĩa.',
      example1Zh: '这是我的书。', example1Vi: 'Đây là sách của tôi.',
      example2Zh: '漂亮的花儿。', example2Vi: 'Hoa đẹp.',
      example3Zh: '他的老师。', example3Vi: 'Giáo viên của anh ấy.',
      quizQuestion: 'Chọn câu đúng: (A) 我书 (B) 我的书 (C) 书的我',
      quizOptions: JSON.stringify(['A', 'B', 'C']),
      quizAnswer: 'B',
      lessonId: lesson1.id,
    },
    {
      title: 'Cấu trúc nhấn mạnh 太...了 (tài...le)',
      formula: '太 + Tính từ + 了',
      explanationVi: 'Biểu thị mức độ cao (quá, cực kỳ), thường dùng để cảm thán.',
      example1Zh: '太好了！', example1Vi: 'Tốt quá rồi!',
      example2Zh: '今天天气太热了。', example2Vi: 'Thời tiết hôm nay nóng quá.',
      example3Zh: '这件衣服太贵了。', example3Vi: 'Bộ quần áo này đắt quá.',
      quizQuestion: 'Điền từ: "这苹果太好吃___。"',
      quizOptions: JSON.stringify(['的', '了', '不']),
      quizAnswer: '了',
      lessonId: lesson2.id,
    },
    {
      title: 'Liên từ tuy... nhưng... 虽然...但是...',
      formula: '虽然 + Mệnh đề 1, 但是 + Mệnh đề 2',
      explanationVi: 'Dùng để biểu thị quan hệ chuyển ngoặt (tuy... nhưng...).',
      example1Zh: '虽然外面下雪，但是屋里很暖和。', example1Vi: 'Tuy bên ngoài tuyết rơi, nhưng trong phòng rất ấm áp.',
      example2Zh: '虽然他生病了，但是他坚持去学校。', example2Vi: 'Tuy anh ấy bị ốm, nhưng anh ấy vẫn kiên trì đến trường.',
      example3Zh: '虽然汉语很难，但是我很喜欢学。', example3Vi: 'Tuy tiếng Trung rất khó, nhưng tôi rất thích học.',
      quizQuestion: 'Điền từ: "虽然今天下雨，______他还是出门了。"',
      quizOptions: JSON.stringify(['但是', '所以', '如果']),
      quizAnswer: 'đáp án: 但是',
      lessonId: lesson3.id,
    },
    {
      title: 'So sánh hơn 比 (bǐ)',
      formula: 'A + 比 + B + Tính từ',
      explanationVi: 'Dùng để so sánh tính chất giữa A và B.',
      example1Zh: '今天比昨天热。', example1Vi: 'Hôm nay nóng hơn hôm qua.',
      example2Zh: '我比你高。', example2Vi: 'Tôi cao hơn bạn.',
      example3Zh: '坐飞机比坐火车快。', example3Vi: 'Đi máy bay nhanh hơn đi tàu hỏa.',
      quizQuestion: 'Sắp xếp: "哥哥 (1) 弟弟 (2) 比 (3) 矮 (4)" để nói "Anh thấp hơn em"',
      quizOptions: JSON.stringify(['1-3-2-4', '2-3-1-4', '1-2-3-4']),
      quizAnswer: '1-3-2-4',
      lessonId: lesson4.id,
    },
    {
      title: 'Cấu trúc nhấn mạnh 是...的 (shì...de)',
      formula: 'Chủ ngữ + 是 + [Thời gian/Địa điểm/Phương thức] + Động từ + 的',
      explanationVi: 'Nhấn mạnh một chi tiết nào đó của hành động đã xảy ra trong quá khứ.',
      example1Zh: '我是去年来的。', example1Vi: 'Tôi đến vào năm ngoái (nhấn mạnh thời gian).',
      example2Zh: '我们是坐飞机来的。', example2Vi: 'Chúng tôi đi bằng máy bay đến (nhấn mạnh phương thức).',
      example3Zh: '这本书是在书店买的。', example3Vi: 'Cuốn sách này mua ở hiệu sách (nhấn mạnh địa điểm).',
      quizQuestion: 'Nhấn mạnh địa điểm: "Tôi mua điện thoại ở Hà Nội"',
      quizOptions: JSON.stringify(['我在河内买手机了。', '我的手机是在河内买的。', '我在河内是买手机。']),
      quizAnswer: 'câu thứ 2 (我的手机是在河内买 of...)',
      lessonId: lesson5.id,
    },
  ]

  for (const g of grammarPoints) {
    await prisma.grammarPoint.create({ data: g })
  }
  console.log('Seeded grammar points.')

  // 7. Seed Speaking Topics (HSKK simulator)
  const speakingTopics = [
    {
      title: 'Giới thiệu bản thân',
      prompt: '请用中文介绍一下你自己（姓名、年龄、国籍、学习汉语的原因等）。\nHãy giới thiệu bản thân bằng tiếng Trung (tên, tuổi, quốc tịch, lý do học tiếng Trung, v.v.).',
      sampleAnswer: '我叫阮文安，今年二十岁，我是越南人。我非常喜欢学习汉语， because I want to travel to China: 因为我想去中国旅游。',
      prepTime: 10,
      recordTime: 60,
      lessonId: lesson1.id,
    },
    {
      title: 'Gia đình của bạn',
      prompt: '你家有几口人？他们是谁？请简单说说你的家人。\nNhà bạn có mấy người? Họ là những ai? Hãy nói đơn giản về người nhà của bạn.',
      sampleAnswer: '我家有四口人：爸爸、妈妈、哥哥和我。我爸爸是医生，我妈妈是家庭主妇。',
      prepTime: 15,
      recordTime: 90,
      lessonId: lesson2.id,
    },
    {
      title: 'Sức khỏe và Thời tiết hôm nay',
      prompt: '今天天气怎么样？你喜欢什么样的天气？为什么？\nThời tiết hôm nay thế nào? Bạn thích thời tiết như thế nào? Tại sao?',
      sampleAnswer: '今天天气很好，是晴天，不冷也不热。我非常喜欢这样的天气。',
      prepTime: 20,
      recordTime: 120,
      lessonId: lesson3.id,
    },
    {
      title: 'Kế hoạch du lịch của bạn',
      prompt: '你喜欢旅游吗？你最想去哪里旅游？为什么？\nBạn thích đi du lịch không? Nơi bạn muốn đi du lịch nhất là đâu? Tại sao?',
      sampleAnswer: '我很喜欢旅游。今年夏天，我最想去中国旅游，因为我想去北京看长城。',
      prepTime: 20,
      recordTime: 120,
      lessonId: lesson4.id,
    },
    {
      title: 'Sở thích mua sắm',
      prompt: '你喜欢买东西吗？你最近买的贵的东西是什么？请说一说。\nBạn thích mua sắm không? Món đồ đắt nhất gần đây bạn mua là gì? Hãy kể về nó.',
      sampleAnswer: '我喜欢买东西。最近我买了一个新手机，虽然有点儿贵，但是非常漂亮，我很喜欢。',
      prepTime: 20,
      recordTime: 120,
      lessonId: lesson5.id,
    },
  ]

  for (const st of speakingTopics) {
    await prisma.speakingTopic.create({ data: st })
  }
  console.log('Seeded speaking topics.')

  // 8. Seed Reading Lessons
  const readingLessons = [
    {
      title: 'Chào hỏi thầy giáo',
      contentZh: '王老师是我们的汉语老师。他今年四十岁，是北京人。王老师对学生很好，大家都非常喜欢他。每天早上，我们看见王老师都会说：“王老师，您好！”',
      translationVi: 'Thầy Vương là giáo viên tiếng Trung của chúng tôi. Thầy năm nay 40 tuổi, là người Bắc Kinh. Thầy Vương rất tốt với học sinh, mọi người đều vô cùng thích thầy. Mỗi sáng, chúng tôi nhìn thấy thầy Vương đều sẽ nói: "Em chào thầy Vương ạ!"',
      questions: JSON.stringify([
        {
          question: '王老师今年多大？(Thầy Vương năm nay bao nhiêu tuổi?)',
          options: ['三十岁', '四十岁', '五十岁'],
          answer: '四十岁',
        },
        {
          question: '王老师是哪儿人？(Thầy Vương là người ở đâu?)',
          options: ['北京人', '上海人', '越南人'],
          answer: '北京人',
        },
      ]),
      lessonId: lesson1.id,
    },
    {
      title: 'Gia đình của Tiểu Minh',
      contentZh: '小明家在上海。他家有三口人：爸爸、妈妈和小明。他爸爸是医生，在医院工作，每天都很忙。他妈妈不工作，是家庭主妇。小明是大学生，他学习很努力。',
      translationVi: 'Nhà Tiểu Minh ở Thượng Hải. Nhà cậu ấy có ba người: bố, mẹ và Tiểu Minh. Bố cậu ấy là bác sĩ, làm việc ở bệnh viện, mỗi ngày đều rất bận. Mẹ cậu ấy không đi làm, là nội trợ. Tiểu Minh là sinh viên đại học, cậu ấy học tập rất nỗ lực.',
      questions: JSON.stringify([
        {
          question: '小明的爸爸在做什么工作？(Bố của Tiểu Minh làm nghề gì?)',
          options: ['老师', '医生', '学生'],
          answer: '医生',
        },
        {
          question: '小明家有几口人？(Nhà Tiểu Minh có mấy người?)',
          options: ['三口人', '四口人', '五口人'],
          answer: '三口人',
        },
      ]),
      lessonId: lesson2.id,
    },
    {
      title: 'Thời tiết bốn mùa',
      contentZh: '北京的一年有四个季节：春、夏、秋、冬。这里的夏天很热，最高气温有三十八度。冬天很冷，常常下雪，气温有时候在零下十度。秋天是北京最好的季节，天气不冷也不热，总是晴天。',
      translationVi: 'Một năm ở Bắc Kinh có bốn mùa: xuân, hạ, thu, đông. Mùa hè ở đây rất nóng, nhiệt độ cao nhất có 38 độ. Mùa đông rất lạnh, thường xuyên có tuyết rơi, nhiệt độ có lúc âm 10 độ. Mùa thu là mùa đẹp nhất ở Bắc Kinh, thời tiết không lạnh cũng không nóng, luôn luôn là trời nắng.',
      questions: JSON.stringify([
        {
          question: '北京最好的季节是哪个？(Mùa đẹp nhất ở Bắc Kinh là mùa nào?)',
          options: ['春天', '夏天', '秋天', '冬天'],
          answer: '秋天',
        },
        {
          question: '北京的冬天天气怎么样？(Mùa đông ở Bắc Kinh thời tiết thế nào?)',
          options: ['很热', '很冷，常常下雪', '非常舒服'],
          answer: '很冷，常常下雪',
        },
      ]),
      lessonId: lesson3.id,
    },
  ]

  for (const rl of readingLessons) {
    await prisma.readingLesson.create({ data: rl })
  }
  console.log('Seeded reading lessons.')

  // 9. Seed Listening Lessons (with mock audio path)
  const listeningLessons = [
    {
      title: 'Nghe đoạn hội thoại chào hỏi',
      audioUrl: '/audio/mock_listening_1.mp3',
      transcriptZh: 'A: 你好，请问你是王老师的学生吗？\nB: 是的，我是王老师的学生。你也是吗？\nA: 不，我不是学生，我是这里的老师，我姓李。',
      pinyin: 'A: Nǐ hǎo, qǐngwèn nǐ shì Wáng lǎoshī de xuéshēng ma?\nB: Shì de, wǒ shì Wáng lǎoshī de xuéshēng. Nǐ yě shì ma?\nA: Bù, wǒ bú shì xuéshēng, wǒ shì zhèlǐ de lǎoshī, wǒ xìng Lǐ.',
      meaningVi: 'A: Chào bạn, xin hỏi bạn có phải học sinh của thầy Vương không?\nB: Vâng đúng vậy, tôi là học sinh của thầy Vương. Bạn cũng vậy à?\nA: Không, tôi không phải học sinh, tôi là giáo viên ở đây, tôi họ Lý.',
      questions: JSON.stringify([
        {
          question: 'B是做什么 class/job 的？(B làm nghề gì?)',
          options: ['学生', '老师', '医生'],
          answer: '学生',
        },
        {
          question: 'A姓什么？(A họ gì?)',
          options: ['王', '李', '张'],
          answer: '李',
        },
      ]),
      lessonId: lesson1.id,
    },
    {
      title: 'Trò chuyện về gia đình',
      audioUrl: '/audio/mock_listening_2.mp3',
      transcriptZh: 'A: 你家有几口人？\nB: 我家有四口人：爸爸、妈妈、哥哥和我。你家呢？\nA: 我家有三口人：爸爸、妈妈和我。我没有兄弟姐妹。',
      pinyin: 'A: Nǐ jiā yǒu jǐ kǒu rén?\nB: Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ. Nǐ jiā ne?\nA: Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ. Wǒ méiyǒu xiōngdì jiěmèi.',
      meaningVi: 'A: Nhà bạn có mấy người?\nB: Nhà tôi có 4 người: bố, mẹ, anh trai và tôi. Còn nhà bạn?\nA: Nhà tôi có 3 người: bố, mẹ và tôi. Tôi không có anh chị em.',
      questions: JSON.stringify([
        {
          question: 'B家有几口人？(Nhà B có mấy người?)',
          options: ['三口', '四口', '五口'],
          answer: '四口',
        },
        {
          question: 'A有没有哥哥？(A có anh trai không?)',
          options: ['有', '没有'],
          answer: '没有',
        },
      ]),
      lessonId: lesson2.id,
    },
    {
      title: 'Hôm nay có lạnh không?',
      audioUrl: '/audio/mock_listening_3.mp3',
      transcriptZh: 'A: 今天外面下雪了，气温零下三度。\nB: 哇，今天真冷。虽然很冷，但是我很喜欢雪。你呢？\nA: 我不喜欢下雪，我喜欢晴天。',
      pinyin: 'A: Jīntiān wàimiàn xiàxuě le, qìwēn língxià sān dù.\nB: Wa, jīntiān zhēn lěng. Suīrán hěn lěng, dànshì wǒ hěn xǐhuān xuě. Nǐ ne?\nA: Wǒ bù xǐhuān xià xuě, wǒ xǐhuān qíngtiān.',
      meaningVi: 'A: Hôm nay bên ngoài tuyết rơi rồi, nhiệt độ âm 3 độ.\nB: Oa, hôm nay lạnh thật. Tuy rất lạnh, nhưng tôi rất thích tuyết. Còn bạn?\nA: Tôi không thích tuyết rơi, tôi thích ngày nắng.',
      questions: JSON.stringify([
        {
          question: '今天的气温是多少度？(Nhiệt độ hôm nay là bao nhiêu độ?)',
          options: ['零下三度', '零下五度', '零度'],
          answer: '零下三度',
        },
        {
          question: 'A喜欢什么样的天气？(A thích thời tiết thế nào?)',
          options: ['下雪天', '阴天', '晴天'],
          answer: '晴天',
        },
      ]),
      lessonId: lesson3.id,
    },
  ]

  for (const ll of listeningLessons) {
    await prisma.listeningLesson.create({ data: ll })
  }
  console.log('Seeded listening lessons.')

  // 10. Seed Writing Tasks
  const writingTasks = [
    {
      title: 'Viết lời chào gửi thầy giáo',
      prompt: 'Hãy viết một bức thư ngắn (khoảng 15-20 chữ) chào hỏi thầy Vương và giới thiệu tên bạn.',
      minWords: 15,
      checklist: JSON.stringify([
        'Chào thầy Vương (王老师，您好)',
        'Giới thiệu tên mình (我叫...)',
        'Viết tối thiểu 15 ký tự Hán',
      ]),
      lessonId: lesson1.id,
    },
    {
      title: 'Mô tả gia đình của em',
      prompt: 'Hãy viết một đoạn văn ngắn (30-40 chữ) giới thiệu về gia đình em (nhà có mấy người, bố mẹ làm nghề gì, sống ở đâu).',
      minWords: 30,
      checklist: JSON.stringify([
        'Nêu số người trong gia đình (我家有...)',
        'Kể tên các thành viên (爸爸，妈妈...)',
        'Dùng từ "谢谢" hoặc "再见"',
      ]),
      lessonId: lesson2.id,
    },
    {
      title: 'Kể về thời tiết yêu thích',
      prompt: 'Hãy viết một đoạn văn ngắn (40-50 chữ) kể về thời tiết hôm nay và thời tiết bạn thích nhất, kết hợp sử dụng cấu trúc "虽然...但是...".',
      minWords: 40,
      checklist: JSON.stringify([
        'Mô tả thời tiết hôm nay (晴/阴/雪)',
        'Sử dụng cấu trúc mặc dù... nhưng... (虽然...但是...)',
        'Nêu lý do thích thời tiết đó',
      ]),
      lessonId: lesson3.id,
    },
  ]

  for (const wt of writingTasks) {
    await prisma.writingTask.create({ data: wt })
  }
  console.log('Seeded writing tasks.')

  // 11. Seed Quizzes (3 quizzes)
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'Kiểm tra bài 1: Chào hỏi & Đại từ',
      description: 'Luyện tập từ vựng chào hỏi, đại từ nhân xưng và cấu trúc sở hữu 的.',
    },
  })

  const quiz2 = await prisma.quiz.create({
    data: {
      lessonId: lesson2.id,
      title: 'Kiểm tra bài 2: Gia đình & Công việc',
      description: 'Luyện tập các từ chỉ người thân, ngành nghề, cấu trúc 太...了.',
    },
  })

  const quiz3 = await prisma.quiz.create({
    data: {
      lessonId: lesson3.id,
      title: 'Kiểm tra bài 3: Thời tiết & Sức khỏe',
      description: 'Bài kiểm tra về từ vựng thời tiết, ốm đau, và liên từ mặc dù... nhưng...',
    },
  })

  const quizQuestions = [
    // Quiz 1 Questions
    {
      quizId: quiz1.id,
      questionText: '“学生” trong tiếng Việt nghĩa là gì?',
      questionType: 'vocabulary',
      options: JSON.stringify(['Giáo viên', 'Học sinh', 'Bác sĩ', 'Giám đốc']),
      correctAnswer: 'Học sinh',
    },
    {
      quizId: quiz1.id,
      questionText: 'Điền từ thích hợp: “他是______老师，我是学生。”',
      questionType: 'grammar',
      options: JSON.stringify(['的', '是', '不', '吗']),
      correctAnswer: '的',
    },
    {
      quizId: quiz1.id,
      questionText: 'Pinyin của chữ “她” là gì?',
      questionType: 'vocabulary',
      options: JSON.stringify(['wǒ', 'nǐ', 'tā', 'shì']),
      correctAnswer: 'tā',
    },

    // Quiz 2 Questions
    {
      quizId: quiz2.id,
      questionText: '“Bố tôi là bác sĩ” dịch sang tiếng Trung là?',
      questionType: 'grammar',
      options: JSON.stringify(['我爸爸是医生。', '我爸爸有医生。', '爸爸我医生是。', '我妈妈是医生。']),
      correctAnswer: '我爸爸是医生。',
    },
    {
      quizId: quiz2.id,
      questionText: 'Từ “谢谢” được phát âm là:',
      questionType: 'vocabulary',
      options: JSON.stringify(['zàijiàn', 'xièxie', 'bàba', 'māma']),
      correctAnswer: 'xièxie',
    },
    {
      quizId: quiz2.id,
      questionText: 'Cấu trúc “太好了” có nghĩa là:',
      questionType: 'grammar',
      options: JSON.stringify(['Không tốt', 'Tốt quá rồi', 'Bình thường', 'Rất tệ']),
      correctAnswer: 'Tốt quá rồi',
    },

    // Quiz 3 Questions
    {
      quizId: quiz3.id,
      questionText: '“生病” có nghĩa là gì?',
      questionType: 'vocabulary',
      options: JSON.stringify(['Sinh nhật', 'Mệt mỏi', 'Ốm, bị bệnh', 'Khỏe mạnh']),
      correctAnswer: 'Ốm, bị bệnh',
    },
    {
      quizId: quiz3.id,
      questionText: 'Từ trái nghĩa với “晴” (Trời nắng) trong bài là:',
      questionType: 'vocabulary',
      options: JSON.stringify(['阴', '零', '药', '雪']),
      correctAnswer: '阴',
    },
    {
      quizId: quiz3.id,
      questionText: 'Điền vế câu thích hợp: “虽然他生病 rồi, ______.”',
      questionType: 'grammar',
      options: JSON.stringify(['所以他不去上学。', '但是他还是坚持去上学。', '因为他很累。']),
      correctAnswer: '但是他还是坚持去上学。',
    },
  ]

  for (const q of quizQuestions) {
    await prisma.quizQuestion.create({ data: q })
  }

  console.log('Seeded quizzes questions.')

  // 11.5 Seed Communication Roadmap & Lessons
  console.log('Seeding Communication Roadmap...')
  const commRoadmap = await prisma.roadmap.create({
    data: {
      title: 'Lộ trình Tiếng Trung Giao tiếp Thực tế',
      description: 'Học giao tiếp tiếng Trung qua 29 tình huống thực tế đời sống, từ đi ngân hàng, ăn nhà hàng, mua sắm đến phỏng vấn xin việc.',
      level: 1,
    }
  })

  const commStage1 = await prisma.roadmapStage.create({
    data: { roadmapId: commRoadmap.id, title: 'Giai đoạn 1: Giao tiếp Đời sống Cơ bản', description: 'Tình huống sinh hoạt thường nhật và các quy tắc hội thoại căn bản.', order: 1 }
  })
  const commStage2 = await prisma.roadmapStage.create({
    data: { roadmapId: commRoadmap.id, title: 'Giai đoạn 2: Mua sắm & Hỏi đường', description: 'Giao tiếp mua bán hàng hóa, hỏi thăm đường sá và đi lại.', order: 2 }
  })
  const commStage3 = await prisma.roadmapStage.create({
    data: { roadmapId: commRoadmap.id, title: 'Giai đoạn 3: Du lịch & Dịch vụ công cộng', description: 'Cách giải quyết giao dịch tại ngân hàng, ăn uống tại nhà hàng, đặt phòng khách sạn, hải quan.', order: 3 }
  })
  const commStage4 = await prisma.roadmapStage.create({
    data: { roadmapId: commRoadmap.id, title: 'Giai đoạn 4: Xã giao & Đời sống Chuyên sâu', description: 'Kỹ năng giao tiếp xã hội, gia đình, công việc nâng cao và chăm sóc sức khỏe.', order: 4 }
  })

  // Group lessons by stage
  const commLessonsRaw = [
    // Stage 1: Giao tiếp Đời sống Cơ bản
    {
      stageId: commStage1.id,
      title: 'Bài 10: Con số và màu sắc',
      description: 'Học cách sử dụng số đếm và nhận diện màu sắc cơ bản.',
      order: 1,
      vocab: [
        { character: '红色', pinyin: 'hóngsè', meaningVi: 'Màu đỏ', exampleZh: '我喜欢红色的衣服。', exampleVi: 'Tôi thích quần áo màu đỏ.', topic: 'colors' },
        { character: '蓝色', pinyin: 'lánsè', meaningVi: 'Màu xanh da trời', exampleZh: '天空是蓝色的。', exampleVi: 'Bầu trời màu xanh.', topic: 'colors' },
        { character: '两', pinyin: 'liǎng', meaningVi: 'Hai (dùng trước lượng từ)', exampleZh: '我有两个苹果。', exampleVi: 'Tôi có hai quả táo.', topic: 'numbers' }
      ],
      grammar: {
        title: 'Sử dụng 两 (liǎng) thay cho 二 (èr)',
        formula: '两 + Lượng từ + Danh từ (VD: 两个人, không dùng 二个人)',
        explanationVi: 'Khi biểu thị số lượng là hai trước lượng từ, ta dùng 两 thay cho 二.',
        example1Zh: '这儿有两个杯子。', example1Vi: 'Ở đây có hai chiếc cốc.',
        example2Zh: '我想买两本书。', example2Vi: 'Tôi muốn mua hai cuốn sách.',
        example3Zh: '他有两个哥哥。', example3Vi: 'Anh ấy có hai người anh trai.',
        quizQuestion: 'Chọn câu đúng diễn đạt "hai người":',
        quizOptions: JSON.stringify(['二个人', '两个人', '二个']),
        quizAnswer: '两个人'
      },
      speaking: {
        title: 'Nói về màu sắc yêu thích',
        prompt: '你喜欢什么颜色？为什么？\nBạn thích màu sắc nào? Tại sao?',
        sampleAnswer: '我非常喜欢蓝色，因为蓝色像天空 the color, 让人觉得很舒服。'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 11: Giới thiệu làm quen',
      description: 'Học cách tự giới thiệu bản thân và hỏi thông tin cơ bản của người đối diện.',
      order: 2,
      vocab: [
        { character: '姓名', pinyin: 'xìngmíng', meaningVi: 'Họ tên', exampleZh: '请写下你的姓名。', exampleVi: 'Vui lòng viết họ tên của bạn xuống.', topic: 'intro' },
        { character: '介绍', pinyin: 'jièshào', meaningVi: 'Giới thiệu', exampleZh: '我来介绍一下。', exampleVi: 'Để tôi giới thiệu một chút.', topic: 'intro' },
        { character: '年龄', pinyin: 'niánlíng', meaningVi: 'Tuổi tác', exampleZh: '年龄不是问题。', exampleVi: 'Tuổi tác không thành vấn đề.', topic: 'intro' }
      ],
      grammar: {
        title: 'Giới thiệu tên với 叫 (jiào)',
        formula: 'Chủ ngữ + 叫 + Tên',
        explanationVi: 'Động từ 叫 dùng để diễn đạt tên gọi của ai đó.',
        example1Zh: '我叫阿平。', example1Vi: 'Tôi tên là Bình.',
        example2Zh: '你叫什么名字？', example2Vi: 'Bạn tên là gì?',
        example3Zh: '他叫小明。', example3Vi: 'Cậu ấy tên là Tiểu Minh.',
        quizQuestion: 'Dịch câu "Tôi tên là Vương":',
        quizOptions: JSON.stringify(['我叫王。', '我是叫王。', '我名字王。']),
        quizAnswer: '我叫王。'
      },
      speaking: {
        title: 'Tự giới thiệu bản thân',
        prompt: '请用中文介绍一下你的姓名 và work.\nHãy giới thiệu họ tên và công việc của bạn bằng tiếng Trung.',
        sampleAnswer: '你好！我叫阿山，今年二十五岁，我是公司职员。很高兴认识你！'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 12: Thanh điệu và những quy tắc cần nhớ',
      description: 'Nắm vững các thanh điệu chính và quy tắc biến âm quan trọng.',
      order: 3,
      vocab: [
        { character: '声调', pinyin: 'shēngdiào', meaningVi: 'Thanh điệu', exampleZh: '汉语有四个声调。', exampleVi: 'Tiếng Trung có 4 thanh điệu.', topic: 'pinyin' },
        { character: '拼音', pinyin: 'pīnyīn', meaningVi: 'Phiên âm', exampleZh: '拼音很重要。', exampleVi: 'Phiên âm rất quan trọng.', topic: 'pinyin' },
        { character: '规则', pinyin: 'guīzé', meaningVi: 'Quy tắc', exampleZh: '这是拼音的规则。', exampleVi: 'Đây là quy tắc phiên âm.', topic: 'pinyin' }
      ],
      grammar: {
        title: 'Quy tắc biến điệu thanh 3 (Half-third tone)',
        formula: 'Thanh 3 + Thanh 3 -> Thanh 2 + Thanh 3 (VD: nǐ + hǎo -> ní hǎo)',
        explanationVi: 'Khi hai âm mang thanh 3 đi liền nhau, thanh thứ nhất chuyển sang đọc thành thanh thứ 2.',
        example1Zh: '你好 (ní hǎo)', example1Vi: 'Chào bạn',
        example2Zh: '我很 (wó hěn)', example2Vi: 'Tôi rất',
        example3Zh: '可以 (ké yǐ)', example3Vi: 'Có thể',
        quizQuestion: 'Chữ "kěyǐ" khi phát âm sẽ biến âm như thế nào?',
        quizOptions: JSON.stringify(['kēyǐ', 'kéyǐ', 'kěyí']),
        quizAnswer: 'kéyǐ'
      },
      speaking: {
        title: 'Luyện đọc biến âm',
        prompt: '请朗读以下词语：你好，可以，辅导。\nHãy đọc to các từ sau: nǐhǎo, kěyǐ, fǔdǎo.',
        sampleAnswer: '你好 (níhǎo), 可以 (kěyǐ), 辅导 (fúdǎo).'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 13: Chào hỏi trong tiếng Trung',
      description: 'Các mẫu câu chào hỏi xã giao thông dụng theo thời gian và đối tượng.',
      order: 4,
      vocab: [
        { character: '你好', pinyin: 'nǐhǎo', meaningVi: 'Chào bạn', exampleZh: '你好，很高兴见到你。', exampleVi: 'Chào bạn, rất vui được gặp bạn.', topic: 'greeting' },
        { character: '您好', pinyin: 'nínhǎo', meaningVi: 'Chào ngài/ông/bà (kính trọng)', exampleZh: '李老师，您好！', exampleVi: 'Em chào thầy Lý ạ!', topic: 'greeting' },
        { character: '早上好', pinyin: 'zǎoshang hǎo', meaningVi: 'Chào buổi sáng', exampleZh: '爸爸，早上好！', exampleVi: 'Bố, chào buổi sáng!', topic: 'greeting' }
      ],
      grammar: {
        title: 'Sử dụng đại từ kính trọng 您 (nín)',
        formula: '您 + 好！',
        explanationVi: 'Dùng 您 thay cho 你 để thể hiện thái độ tôn kính, lịch thiệp với người bề trên.',
        example1Zh: '老师，您好！', example1Vi: 'Chào thầy cô ạ!',
        example2Zh: '经理，您喝茶吗？', example2Vi: 'Giám đốc, ngài uống trà không ạ?',
        example3Zh: '您贵姓？', example3Vi: 'Họ của ngài là gì ạ?',
        quizQuestion: 'Dành câu chào kính trọng cho đối tác khách hàng:',
        quizOptions: JSON.stringify(['你好', '您好', '你们好']),
        quizAnswer: '您好'
      },
      speaking: {
        title: 'Chào hỏi thầy giáo',
        prompt: '当你遇到王老师，你应该怎么打招呼？\nKhi bạn gặp thầy Vương, bạn nên chào thế nào?',
        sampleAnswer: '王老师，早上好！您身体好吗？'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 14: Thời gian trong tiếng Trung',
      description: 'Học cách hỏi và nói về thời gian, ngày tháng, giờ giấc.',
      order: 5,
      vocab: [
        { character: '时间', pinyin: 'shíjiān', meaningVi: 'Thời gian', exampleZh: '我没有时间。', exampleVi: 'Tôi không có thời gian.', topic: 'time' },
        { character: '现在', pinyin: 'xiànzài', meaningVi: 'Bây giờ, hiện tại', exampleZh: '现在几点？', exampleVi: 'Bây giờ là mấy giờ?', topic: 'time' },
        { character: '点钟', pinyin: 'diǎnzhōng', meaningVi: 'Giờ đồng hồ', exampleZh: '现在是八点钟。', exampleVi: 'Bây giờ là 8 giờ.', topic: 'time' }
      ],
      grammar: {
        title: 'Hỏi giờ giấc với 几点 (jǐ diǎn)',
        formula: 'Chủ ngữ + 现在 + 几点？',
        explanationVi: 'Dùng từ để hỏi 几 đi cùng lượng từ 点 để hỏi thời gian hiện tại.',
        example1Zh: '现在几点？', example1Vi: 'Bây giờ mấy giờ?',
        example2Zh: '现在八点了。', example2Vi: 'Bây giờ 8 giờ rồi.',
        example3Zh: '你几点去学校？', example3Vi: 'Mấy giờ bạn đi học?',
        quizQuestion: 'Câu nào diễn đạt "Bây giờ là 5 giờ rưỡi"?',
        quizOptions: JSON.stringify(['现在五点半。', '现在五点三十。', 'Cả hai đều đúng']),
        quizAnswer: 'Cả hai đều đúng'
      },
      speaking: {
        title: 'Hỏi giờ giấc',
        prompt: '请说出“Bây giờ là 10 giờ 15 phút” bằng tiếng Trung.\nHãy nói câu này bằng tiếng Trung.',
        sampleAnswer: '现在是十点十五分。'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 25: Gọi điện thoại',
      description: 'Hỏi han và liên hệ qua điện thoại, nói chuyện gián tiếp.',
      order: 6,
      vocab: [
        { character: '打电话', pinyin: 'dǎ diànhuà', meaningVi: 'Gọi điện thoại', exampleZh: '我给妈妈打电话。', exampleVi: 'Tôi gọi điện cho mẹ.', topic: 'phone' },
        { character: '接电话', pinyin: 'jiē diànhuà', meaningVi: 'Nhận cuộc gọi, bắt máy', exampleZh: '他在接电话。', exampleVi: 'Anh ấy đang nghe điện thoại.', topic: 'phone' },
        { character: '留言', pinyin: 'liúyán', meaningVi: 'Lời nhắn, để lại lời nhắn', exampleZh: '请给他留言。', exampleVi: 'Vui lòng để lại lời nhắn cho anh ấy.', topic: 'phone' }
      ],
      grammar: {
        title: 'Cách trả lời điện thoại với 喂 (wèi)',
        formula: '喂，请问...在吗？',
        explanationVi: 'Từ 喂 dùng làm thán từ mở đầu cuộc điện thoại (tương đương Alo).',
        example1Zh: '喂，你好！', example1Vi: 'Alo, chào bạn!',
        example2Zh: '喂，请问张经理在吗？', example2Vi: 'Alo, xin hỏi giám đốc Trương có ở đó không?',
        example3Zh: '喂，我是小明。', example3Vi: 'Alo, tôi là Tiểu Minh đây.',
        quizQuestion: 'Thán từ trả lời cuộc gọi trong tiếng Trung là gì?',
        quizOptions: JSON.stringify(['喂 (wèi)', '哈啰 (hāluō)', '是 (shì)']),
        quizAnswer: '喂 (wèi)'
      },
      speaking: {
        title: 'Gọi điện hỏi thăm bạn bè',
        prompt: '打个电话给你的中国朋友，问他今天有没有空。\nGọi điện cho một người bạn Trung Quốc hỏi hôm nay có rảnh không.',
        sampleAnswer: '喂，大卫，你好！请问你今天下午有空吗？我们一起去喝茶吧。'
      }
    },
    {
      stageId: commStage1.id,
      title: 'Bài 33: Chủ đề Thời tiết',
      description: 'Mô tả khí hậu, thời tiết các mùa nóng lạnh.',
      order: 7,
      vocab: [
        { character: '天气', pinyin: 'tiānqì', meaningVi: 'Thời tiết', exampleZh: '今天天气不错。', exampleVi: 'Hôm nay thời tiết khá tốt.', topic: 'weather' },
        { character: '下雨', pinyin: 'xiàyǔ', meaningVi: 'Mưa', exampleZh: '外面下大雨了。', exampleVi: 'Bên ngoài trời mưa to rồi.', topic: 'weather' },
        { character: '刮风', pinyin: 'guāfēng', meaningVi: 'Gió thổi', exampleZh: '秋天经常刮风。', exampleVi: 'Mùa thu thường xuyên gió thổi.', topic: 'weather' }
      ],
      grammar: {
        title: 'Hỏi tình hình thời tiết với 怎么样 (zěnmeyàng)',
        formula: 'Chủ ngữ + 怎么样？',
        explanationVi: 'Dùng 怎么样 để hỏi về tính chất, trạng thái của sự vật/sự việc.',
        example1Zh: '今天天气怎么样？', example1Vi: 'Thời tiết hôm nay thế nào?',
        example2Zh: '外面怎么样？', example2Vi: 'Bên ngoài thế nào?',
        example3Zh: '这苹果味道怎么样？', example3Vi: 'Quả táo này vị thế nào?',
        quizQuestion: 'Dịch câu "Thời tiết Hà Nội hôm nay thế nào?":',
        quizOptions: JSON.stringify(['河内天气今天好吗？', '今天河内天气怎么样？', '河内今天天气什么？']),
        quizAnswer: '今天河内天气怎么样？'
      },
      speaking: {
        title: 'Mô tả thời tiết hôm nay',
        prompt: '说一说你那里今天的气温和天气。\nHãy nói về thời tiết chỗ bạn hôm nay.',
        sampleAnswer: '今天我这里天气很热，没有风，下午 may rain.'
      }
    },

    // Stage 2: Mua sắm & Hỏi đường
    {
      stageId: commStage2.id,
      title: 'Bài 15: Mua bán hoa quả',
      description: 'Hỏi giá cả và giao tiếp khi đi mua trái cây ngoài chợ.',
      order: 1,
      vocab: [
        { character: '水果', pinyin: 'shuǐguǒ', meaningVi: 'Hoa quả, trái cây', exampleZh: '多吃水果对身体好。', exampleVi: 'Ăn nhiều hoa quả tốt cho sức khỏe.', topic: 'fruit' },
        { character: '斤', pinyin: 'jīn', meaningVi: 'Cân (bằng 0.5kg)', exampleZh: '苹果多少钱一斤？', exampleVi: 'Táo bao nhiêu tiền nửa cân?', topic: 'fruit' },
        { character: '新鲜', pinyin: 'xīnxiān', meaningVi: 'Tươi ngon', exampleZh: '这些香蕉很新鲜。', exampleVi: 'Những quả chuối này rất tươi.', topic: 'fruit' }
      ],
      grammar: {
        title: 'Hỏi đơn giá của sản phẩm',
        formula: 'Danh từ + 多少钱 + Lượng từ',
        explanationVi: 'Sử dụng cấu trúc này để hỏi giá của một đơn vị đo lường cụ thể.',
        example1Zh: '西瓜多少钱一斤？', example1Vi: 'Dưa hấu bao nhiêu tiền nửa cân?',
        example2Zh: '咖啡多少钱一杯？', example2Vi: 'Cà phê bao nhiêu tiền một ly?',
        example3Zh: '水多少钱一瓶？', example3Vi: 'Nước bao nhiêu tiền một chai?',
        quizQuestion: 'Điền từ hỏi giá: "这件衣服______钱？"',
        quizOptions: JSON.stringify(['怎么', '多少', '几']),
        quizAnswer: '多少'
      },
      speaking: {
        title: 'Hỏi giá hoa quả',
        prompt: '去水果摊买2斤新鲜苹果，问问老板多少钱。\nĐến hàng hoa quả mua 2 cân táo, hỏi chủ cửa hàng giá cả.',
        sampleAnswer: '老板，请问这个苹果新鲜吗？多少钱一斤？我要买两斤。'
      }
    },
    {
      stageId: commStage2.id,
      title: 'Bài 16: Mua sắm quần áo',
      description: 'Giao tiếp khi chọn lựa kích cỡ quần áo và mặc thử đồ.',
      order: 2,
      vocab: [
        { character: '衣服', pinyin: 'yīfu', meaningVi: 'Quần áo', exampleZh: '这件衣服很合适。', exampleVi: 'Bộ quần áo này rất vừa vặn.', topic: 'shopping' },
        { character: '试穿', pinyin: 'shìchuān', meaningVi: 'Mặc thử', exampleZh: '我可以试穿一下吗？', exampleVi: 'Tôi có thể mặc thử một chút không?', topic: 'shopping' },
        { character: '打折', pinyin: 'dǎzhé', meaningVi: 'Giảm giá', exampleZh: '今天商场打折。', exampleVi: 'Hôm nay trung tâm thương mại giảm giá.', topic: 'shopping' }
      ],
      grammar: {
        title: 'Thử làm gì đó với động từ trùng điệp',
        formula: 'V + 一下 / VV',
        explanationVi: 'Lặp lại động từ hoặc thêm 一下 để biểu thị hành động diễn ra nhanh, thử làm gì đó.',
        example1Zh: '我试一下这件衣服。', example1Vi: 'Tôi thử bộ quần áo này một chút.',
        example2Zh: '你看一下。', example2Vi: 'Bạn nhìn thử đi.',
        example3Zh: '你想一想。', example3Vi: 'Bạn nghĩ thử xem.',
        quizQuestion: 'Mẫu câu đề xuất mặc thử đồ nào đúng?',
        quizOptions: JSON.stringify(['我可以试一下吗？', '我可以试试试吗？', 'Cả hai đều đúng']),
        quizAnswer: '我可以试一下吗？'
      },
      speaking: {
        title: 'Giao tiếp mua quần áo',
        prompt: '你想买一件红色的外套，问售货员能不能试穿。\nBạn muốn mua một chiếc áo khoác màu đỏ, hỏi nhân viên có thử được không.',
        sampleAnswer: '你好，我很喜欢这件红色的外套，请问我可以试穿一下吗？有大号的吗？'
      }
    },
    {
      stageId: commStage2.id,
      title: 'Bài 18: Đi taxi tiếng Trung',
      description: 'Đặt xe, báo điểm đến và chỉ đường cho tài xế taxi.',
      order: 3,
      vocab: [
        { character: '出租车', pinyin: 'chūzūchē', meaningVi: 'Xe taxi', exampleZh: '我们坐出租车去吧。', exampleVi: 'Chúng ta đi taxi đi.', topic: 'travel' },
        { character: '司机', pinyin: 'sījī', meaningVi: 'Tài xế', exampleZh: '司机师傅，请开车。', exampleVi: 'Bác tài ơi, làm ơn chạy xe.', topic: 'travel' },
        { character: '地址', pinyin: 'dìzhǐ', meaningVi: 'Địa chỉ', exampleZh: '这是我去的地址。', exampleVi: 'Đây là địa chỉ tôi muốn đi.', topic: 'travel' }
      ],
      grammar: {
        title: 'Chỉ hướng đi bằng 往 (wǎng)',
        formula: '往 + Hướng + Động từ',
        explanationVi: 'Giới từ 往 biểu thị phương hướng của hành động đi, chạy, rẽ.',
        example1Zh: '司机师傅，往右拐。', example1Vi: 'Bác tài ơi, rẽ phải.',
        example2Zh: '一直往前走。', example2Vi: 'Đi thẳng về phía trước.',
        example3Zh: '往左转就到了。', example3Vi: 'Rẽ trái là tới.',
        quizQuestion: 'Dịch cụm từ "rẽ phải":',
        quizOptions: JSON.stringify(['往右拐', '往left拐', '右边拐']),
        quizAnswer: '往右拐'
      },
      speaking: {
        title: 'Báo địa điểm cho bác tài',
        prompt: 'Lên xe taxi và nói với tài xế đưa bạn đến khách sạn Bắc Kinh.',
        sampleAnswer: '司机师傅，你好！请送我去北京酒店，谢谢！'
      }
    },
    {
      stageId: commStage2.id,
      title: 'Bài 19: Hỏi đường tiếng Trung',
      description: 'Cách hỏi đường đi, các vị trí xung quanh và định hướng.',
      order: 4,
      vocab: [
        { character: '附近', pinyin: 'fùjìn', meaningVi: 'Gần đây', exampleZh: '附近有超市吗？', exampleVi: 'Gần đây có siêu thị không?', topic: 'travel' },
        { character: '怎么走', pinyin: 'zěnme zǒu', meaningVi: 'Đi thế nào', exampleZh: '去银行怎么走？', exampleVi: 'Đi đến ngân hàng đi như thế nào?', topic: 'travel' },
        { character: '问路', pinyin: 'wènlù', meaningVi: 'Hỏi đường', exampleZh: '我去问路。', exampleVi: 'Tôi đi hỏi đường.', topic: 'travel' }
      ],
      grammar: {
        title: 'Cấu trúc hỏi đường đi 怎么走 (zěnme zǒu)',
        formula: 'Địa điểm + 怎么走？',
        explanationVi: 'Dùng để hỏi cách thức di chuyển, phương hướng đi tới một địa điểm.',
        example1Zh: '请问，火车站怎么走？', example1Vi: 'Xin hỏi, đi đến ga tàu hỏa đi thế nào?',
        example2Zh: '洗手间怎么走？', example2Vi: 'Nhà vệ sinh đi thế nào?',
        example3Zh: '去机场怎么走？', example3Vi: 'Đi sân bay đi thế nào?',
        quizQuestion: 'Chọn câu hỏi đường đến bệnh viện đúng:',
        quizOptions: JSON.stringify(['医院怎么走？', '去医院怎么走？', 'Cả hai đều đúng']),
        quizAnswer: 'Cả hai đều đúng'
      },
      speaking: {
        title: 'Hỏi đường đến siêu thị',
        prompt: 'Hỏi một người đi đường cách đi đến siêu thị gần nhất.',
        sampleAnswer: '你好，请问这附近有超市吗？超市怎么走？'
      }
    },
    {
      stageId: commStage2.id,
      title: 'Bài 20: Mua thẻ điện thoại',
      description: 'Mua thẻ cào và nạp tiền tài khoản viễn thông.',
      order: 5,
      vocab: [
        { character: '电话卡', pinyin: 'diànhuàkǎ', meaningVi: 'Thẻ điện thoại', exampleZh: '我要买一张电话卡。', exampleVi: 'Tôi muốn mua một chiếc thẻ điện thoại.', topic: 'phone' },
        { character: '充值', pinyin: 'chōngzhí', meaningVi: 'Nạp tiền', exampleZh: '我想充值五十元。', exampleVi: 'Tôi muốn nạp 50 tệ.', topic: 'phone' },
        { character: '号码', pinyin: 'hàomǎ', meaningVi: 'Số điện thoại', exampleZh: '你的手机号码是多少？', exampleVi: 'Số điện thoại của bạn là bao nhiêu?', topic: 'phone' }
      ],
      grammar: {
        title: 'Cấu trúc yêu cầu với 给 (gěi)',
        formula: '给我 + Động từ + Danh từ',
        explanationVi: 'Biểu thị hành động thực hiện cho đối tượng nói.',
        example1Zh: '请给我一杯水。', example1Vi: 'Vui lòng cho tôi một cốc nước.',
        example2Zh: '给我看一下你的卡。', example2Vi: 'Cho tôi xem thẻ của bạn một chút.',
        example3Zh: '老板，给我一张电话卡。', example3Vi: 'Chủ quán, cho tôi một thẻ điện thoại.',
        quizQuestion: 'Dịch câu "Cho tôi một ly cà phê":',
        quizOptions: JSON.stringify(['给我一杯咖啡。', '杯咖啡给我。', '我咖啡一杯。']),
        quizAnswer: '给我一杯咖啡。'
      },
      speaking: {
        title: 'Mua thẻ điện thoại',
        prompt: 'Đến cửa hàng tạp hóa mua thẻ điện thoại mệnh giá 100 tệ.',
        sampleAnswer: '老板，你好！我想买一张一百块钱的电话卡，这里可以充值吗？'
      }
    },

    // Stage 3: Du lịch & Dịch vụ công cộng
    {
      stageId: commStage3.id,
      title: 'Bài 8: Đi ngân hàng giao dịch',
      description: 'Học cách đổi tiền, gửi tiền và thực hiện các dịch vụ tại quầy ngân hàng.',
      order: 1,
      vocab: [
        { character: '银行', pinyin: 'yínháng', meaningVi: 'Ngân hàng', exampleZh: '我去银行取钱。', exampleVi: 'Tôi đi ngân hàng rút tiền.', topic: 'bank' },
        { character: '存钱', pinyin: 'cúnqián', meaningVi: 'Gửi tiền', exampleZh: '我想存五百元。', exampleVi: 'Tôi muốn gửi 500 tệ.', topic: 'bank' },
        { character: '取钱', pinyin: 'qǔqián', meaningVi: 'Rút tiền', exampleZh: '我想取一千元。', exampleVi: 'Tôi muốn rút 1000 tệ.', topic: 'bank' }
      ],
      grammar: {
        title: 'Động từ ly hợp (Separable verbs) biểu thị hành động',
        formula: 'V + O',
        explanationVi: 'Động từ ly hợp gồm 2 phần. Khi chèn trạng từ thời gian hay số lượng, phải chèn vào giữa.',
        example1Zh: '他存了三千块钱。', example1Vi: 'Anh ấy đã gửi 3000 tệ.',
        example2Zh: '我取了一次钱。', example2Vi: 'Tôi đã rút tiền một lần.',
        example3Zh: '你在哪儿取钱？', example3Vi: 'Bạn rút tiền ở đâu?',
        quizQuestion: 'Điền từ đúng: "我明天去银行______钱。"',
        quizOptions: JSON.stringify(['取', '存', 'Cả hai đều đúng']),
        quizAnswer: 'Cả hai đều đúng'
      },
      speaking: {
        title: 'Giao dịch đổi tiền',
        prompt: 'Muốn đổi 500 Đô la Mỹ sang Nhân dân tệ tại quầy ngân hàng, bạn nói thế nào?',
        sampleAnswer: '你好，我想把五百美元换成人民币，请问今天的汇率是多少？'
      }
    },
    {
      stageId: commStage3.id,
      title: 'Bài 9: Đi ăn nhà hàng',
      description: 'Học cách gọi món, chọn thực đơn và yêu cầu thanh toán hóa đơn.',
      order: 2,
      vocab: [
        { character: '菜单', pinyin: 'càidān', meaningVi: 'Thực đơn', exampleZh: '服务员，请给我菜单。', exampleVi: 'Phục vụ, cho tôi xem thực đơn.', topic: 'restaurant' },
        { character: '点菜', pinyin: 'diǎncài', meaningVi: 'Gọi món', exampleZh: '我们现在点菜吧。', exampleVi: 'Chúng ta gọi món bây giờ đi.', topic: 'restaurant' },
        { character: '结账', pinyin: 'jiézhàng', meaningVi: 'Thanh toán tiền', exampleZh: '服务员，结账！', exampleVi: 'Phục vụ, thanh toán tiền!', topic: 'restaurant' }
      ],
      grammar: {
        title: 'Cấu trúc đề xuất rủ rê 咱们...吧 (zánmen...ba)',
        formula: '咱们 + Hành động + 吧',
        explanationVi: 'Dùng 咱们 (chúng ta) kèm trợ từ 吧 ở cuối để rủ rê.',
        example1Zh: '咱们去吃火锅吧！', example1Vi: 'Chúng ta đi ăn lẩu đi!',
        example2Zh: '咱们点菜吧。', example2Vi: 'Chúng ta gọi món đi.',
        example3Zh: '咱们走吧。', example3Vi: 'Chúng ta đi thôi.',
        quizQuestion: 'Dịch câu "Chúng ta đi ăn cơm đi":',
        quizOptions: JSON.stringify(['咱们去吃饭吧。', '我去吃饭吧。', '咱们吃饭是。']),
        quizAnswer: '咱们去吃饭吧。'
      },
      speaking: {
        title: 'Gọi món tại nhà hàng',
        prompt: 'Gọi món một đĩa sủi cảo và một chai bia lạnh tại nhà hàng.',
        sampleAnswer: '服务员, 我要点菜。一盘饺子和一瓶冷啤酒，谢谢！'
      }
    },
    {
      stageId: commStage3.id,
      title: 'Bài 21: Đặt phòng khách sạn',
      description: 'Đặt phòng trước và làm thủ tục check-in tại quầy lễ tân khách sạn.',
      order: 3,
      vocab: [
        { character: '预订', pinyin: 'yùdìng', meaningVi: 'Đặt trước', exampleZh: '我已经预订了房间。', exampleVi: 'Tôi đã đặt phòng trước rồi.', topic: 'hotel' },
        { character: '房间', pinyin: 'fángjiān', meaningVi: 'Căn phòng', exampleZh: '房间很大很干净。', exampleVi: 'Căn phòng rất to và sạch sẽ.', topic: 'hotel' },
        { character: '身份证', pinyin: 'shēnfènzhèng', meaningVi: 'Thẻ căn cước, hộ chiếu', exampleZh: '请出示您的身份证。', exampleVi: 'Vui lòng xuất trình thẻ căn cước của ngài.', topic: 'hotel' }
      ],
      grammar: {
        title: 'Động từ kết quả biểu thị trạng thái đã làm xong',
        formula: 'V + 好',
        explanationVi: 'Thêm 好 sau động từ để biểu thị hành động đã hoàn tất một cách tốt đẹp.',
        example1Zh: '我已经订好房间了。', example1Vi: 'Tôi đã đặt xong phòng rồi.',
        example2Zh: '机票买好了。', example2Vi: 'Vé máy bay đã mua xong rồi.',
        example3Zh: '准备好了吗？', example3Vi: 'Đã chuẩn bị xong chưa?',
        quizQuestion: 'Điền từ biểu thị đặt xong xuôi: "房间已经订___了。"',
        quizOptions: JSON.stringify(['了', '好', '过']),
        quizAnswer: '好'
      },
      speaking: {
        title: 'Làm thủ tục nhận phòng',
        prompt: 'Nói với lễ tân bạn đã đặt trước phòng đơn tên Nguyễn Văn An.',
        sampleAnswer: '你好，我预订了一个单人房，我叫阮文安，这是我的护照。'
      }
    },
    {
      stageId: commStage3.id,
      title: 'Bài 22: Mua vé máy bay',
      description: 'Lựa chọn chuyến bay, đặt vé một chiều và khứ hồi.',
      order: 4,
      vocab: [
        { character: '机票', pinyin: 'jīpiào', meaningVi: 'Vé máy bay', exampleZh: '机票太贵了。', exampleVi: 'Vé máy bay đắt quá.', topic: 'travel' },
        { character: '往返', pinyin: 'wǎngfǎn', meaningVi: 'Khứ hồi, đi và về', exampleZh: '我想买往返机票。', exampleVi: 'Tôi muốn mua vé khứ hồi.', topic: 'travel' },
        { character: '航班', pinyin: 'hángbān', meaningVi: 'Chuyến bay', exampleZh: '今天的航班准时。', exampleVi: 'Chuyến bay hôm nay đúng giờ.', topic: 'travel' }
      ],
      grammar: {
        title: 'Phân biệt 往返 (wǎngfǎn) và 单程 (dānchéng)',
        formula: '往返机票 vs 单程机票',
        explanationVi: 'Dùng hai danh từ định ngữ này để phân biệt loại vé máy bay hoặc vé tàu.',
        example1Zh: '买往返机票便宜一点。', example1Vi: 'Mua vé khứ hồi rẻ hơn một chút.',
        example2Zh: '我要买一张去上海的单程票。', example2Vi: 'Tôi muốn mua một vé một chiều đi Thượng Hải.',
        example3Zh: '这趟航班是往返 của.', example3Vi: 'Chuyến bay này là khứ hồi.',
        quizQuestion: 'Từ chỉ "vé một chiều" là gì?',
        quizOptions: JSON.stringify(['单程票', '往返票', '机票']),
        quizAnswer: '单程票'
      },
      speaking: {
        title: 'Đặt vé máy bay đi Bắc Kinh',
        prompt: 'Đặt vé máy bay khứ hồi từ Hà Nội đi Bắc Kinh vào ngày mai.',
        sampleAnswer: '你好，我想买明天去北京的往返机票，请问 còn vé không?'
      }
    },
    {
      stageId: commStage3.id,
      title: 'Bài 23: Qua hải quan',
      description: 'Khai báo kiểm tra hộ chiếu và nhập cảnh tại sân bay quốc tế.',
      order: 5,
      vocab: [
        { character: '海关', pinyin: 'hǎiguān', meaningVi: 'Hải quan', exampleZh: '我们要过海关。', exampleVi: 'Chúng ta phải đi qua hải quan.', topic: 'travel' },
        { character: '护照', pinyin: 'hùzhào', meaningVi: 'Hộ chiếu', exampleZh: '请把护照给我。', exampleVi: 'Làm ơn đưa hộ chiếu cho tôi.', topic: 'travel' },
        { character: '申报', pinyin: 'shēnbào', meaningVi: 'Khai báo', exampleZh: '你有东西要申报吗？', exampleVi: 'Bạn có đồ vật gì cần khai báo không?', topic: 'travel' }
      ],
      grammar: {
        title: 'Mẫu câu kiểm tra hành động 检查 (jiǎnchá)',
        formula: '请让我检查 + Danh từ',
        explanationVi: 'Động từ 检查 dùng để yêu cầu soát vé, kiểm tra hộ chiếu, hành lý.',
        example1Zh: '请让我检查您的护照。', example1Vi: 'Vui lòng cho tôi kiểm tra hộ chiếu của ngài.',
        example2Zh: '海关要检查行李。', example2Vi: 'Hải quan cần kiểm tra hành lý.',
        example3Zh: '医生帮我检查身体。', example3Vi: 'Bác sĩ kiểm tra sức khỏe giúp tôi.',
        quizQuestion: 'Dịch câu "Tôi kiểm tra hộ chiếu một chút":',
        quizOptions: JSON.stringify(['我检查一下护照。', '护照我一下检查。', '我护照检查。']),
        quizAnswer: '我检查一下护照。'
      },
      speaking: {
        title: 'Trả lời hải quan',
        prompt: 'Nói với nhân viên hải quan bạn đi du lịch Trung Quốc trong 7 ngày.',
        sampleAnswer: '你好，这是我的护照。我来中国旅游，一共呆七天。'
      }
    },
    {
      stageId: commStage3.id,
      title: 'Bài 24: Ký gửi hành lý',
      description: 'Làm thủ tục ký gửi hành lý cồng kềnh tại quầy làm thủ tục bay.',
      order: 6,
      vocab: [
        { character: '行李', pinyin: 'xíngli', meaningVi: 'Hành lý', exampleZh: '我的行李在哪儿？', exampleVi: 'Hành lý của tôi ở đâu?', topic: 'travel' },
        { character: '托运', pinyin: 'tuōyùn', meaningVi: 'Ký gửi', exampleZh: '我要托运这个箱子。', exampleVi: 'Tôi muốn ký gửi chiếc vali này.', topic: 'travel' },
        { character: '超重', pinyin: 'chāozhòng', meaningVi: 'Quá cân', exampleZh: '你的行李超重了。', exampleVi: 'Hành lý của bạn bị quá cân rồi.', topic: 'travel' }
      ],
      grammar: {
        title: 'Nói về trọng lượng bằng 公斤 (gōngjīn)',
        formula: 'Số từ + 公斤',
        explanationVi: 'Lượng từ 公斤 tương đương kilogram trong tiếng Việt dùng để chỉ cân nặng.',
        example1Zh: '定重二十公斤。', example1Vi: 'Hành lý quy định nặng 20 kg.',
        example2Zh: '超重一公斤要付多少钱？', example2Vi: 'Quá cân 1 kg phải trả bao nhiêu tiền?',
        example3Zh: '限重二十三公斤。', example3Vi: 'Giới hạn trọng lượng là 23 kg.',
        quizQuestion: 'Mệnh giá trọng lượng "kilogram" tiếng Trung là gì?',
        quizOptions: JSON.stringify(['斤', '公斤', '两']),
        quizAnswer: '公斤'
      },
      speaking: {
        title: 'Thủ tục ký gửi hành lý',
        prompt: 'Nói với nhân viên quầy bay bạn muốn ký gửi một chiếc vali lớn.',
        sampleAnswer: '你好，我想托运这个大行李箱，这个小背包我可以 mang lên máy bay?'
      }
    },

    // Stage 4: Xã giao & Đời sống Chuyên sâu
    {
      stageId: commStage4.id,
      title: 'Bài 17: Du lịch tham quan',
      description: 'Lên kế hoạch đi ngắm phong cảnh và chụp ảnh lưu niệm.',
      order: 1,
      vocab: [
        { character: '旅游', pinyin: 'lǚyóu', meaningVi: 'Du lịch', exampleZh: '去中国旅游很开心。', exampleVi: 'Đi du lịch Trung Quốc rất vui.', topic: 'travel' },
        { character: '风景', pinyin: 'fēngjǐng', meaningVi: 'Phong cảnh', exampleZh: '这里的风景真美。', exampleVi: 'Phong cảnh ở đây đẹp thật.', topic: 'travel' },
        { character: '拍照', pinyin: 'pāizhào', meaningVi: 'Chụp ảnh', exampleZh: '我们在这儿拍照吧。', exampleVi: 'Chúng ta chụp ảnh ở đây đi.', topic: 'travel' }
      ],
      grammar: {
        title: 'Bày tỏ ý định bằng 想要 (xiǎngyào)',
        formula: 'Chủ ngữ + 想要 + Động từ + Tân ngữ',
        explanationVi: 'Dùng 想要 để thể hiện mong muốn, dự định thực hiện một hành động nào đó.',
        example1Zh: '我想要去北京旅游。', example1Vi: 'Tôi muốn đi du lịch Bắc Kinh.',
        example2Zh: '我想要买这块手表。', example2Vi: 'Tôi muốn mua chiếc đồng hồ này.',
        example3Zh: '你想要去哪儿拍照？', example3Vi: 'Bạn muốn đi đâu chụp ảnh?',
        quizQuestion: 'Dịch câu "Tôi muốn chụp ảnh phong cảnh":',
        quizOptions: JSON.stringify(['我想要拍照风景。', '我想要拍风景照。', 'Cả hai đều đúng']),
        quizAnswer: '我想要拍风景照'
      },
      speaking: {
        title: 'Hỏi ý kiến đi du lịch',
        prompt: 'Rủ người bạn Trung Quốc cùng đi tham quan Vạn Lý Trường Thành.',
        sampleAnswer: '明天天气很好, 我们一起去长城旅游拍照吧，怎么样？'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 26: Cảm ơn và nhờ giúp đỡ',
      description: 'Cách bày tỏ sự biết ơn và yêu cầu sự giúp đỡ từ người khác.',
      order: 2,
      vocab: [
        { character: '感谢', pinyin: 'gǎnxiè', meaningVi: 'Cảm ơn', exampleZh: '非常感谢你的帮助！', exampleVi: 'Rất cảm ơn sự giúp đỡ của bạn!', topic: 'polite' },
        { character: '帮忙', pinyin: 'bāngmáng', meaningVi: 'Giúp đỡ', exampleZh: '你可以帮我的忙吗？', exampleVi: 'Bạn có thể giúp tôi một tay không?', topic: 'polite' },
        { character: '客气', pinyin: 'kèqi', meaningVi: 'Khách sáo', exampleZh: '大家都是朋友，别客气。', exampleVi: 'Mọi người đều là bạn bè, đừng khách sáo.', topic: 'polite' }
      ],
      grammar: {
        title: 'Đáp lại lời cảm ơn bằng 不客气 (bú kèqi)',
        formula: '谢谢 -> 不客气 / 别客气',
        explanationVi: 'Cách xã giao tiêu chuẩn để đáp lại khi có người cảm ơn mình.',
        example1Zh: '不客气，这是我应该做的。', example1Vi: 'Không có chi, đây là việc tôi nên làm.',
        example2Zh: '别客气，小事一桩。', example2Vi: 'Đừng khách khí, chuyện nhỏ thôi.',
        example3Zh: '不用谢！', example3Vi: 'Không cần cảm ơn đâu!',
        quizQuestion: 'Đáp án lịch sự nhất khi có người nói "谢谢你":',
        quizOptions: JSON.stringify(['不客气', '对不起', '没关系']),
        quizAnswer: '不客气'
      },
      speaking: {
        title: 'Nhờ vả và cảm ơn',
        prompt: 'Nhờ đồng nghiệp mang hộ cốc nước và cảm ơn họ.',
        sampleAnswer: '小王，你可以帮我拿一杯水吗？谢谢 tu! - 不客气！'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 27: Xin lỗi và tha thứ',
      description: 'Cách xin lỗi khi làm sai và phản hồi chấp nhận lời xin lỗi.',
      order: 3,
      vocab: [
        { character: '对不起', pinyin: 'duìbuqǐ', meaningVi: 'Xin lỗi', exampleZh: '对不起，我迟到了。', exampleVi: 'Xin lỗi, tôi đến muộn rồi.', topic: 'polite' },
        { character: '没关系', pinyin: 'méiguānxi', meaningVi: 'Không sao đâu', exampleZh: '没关系，我也刚到。', exampleVi: 'Không sao, tôi cũng vừa mới đến.', topic: 'polite' },
        { character: '原谅', pinyin: 'yuánliàng', meaningVi: 'Tha thứ', exampleZh: '请原谅我这一次。', exampleVi: 'Xin hãy tha thứ cho tôi lần này.', topic: 'polite' }
      ],
      grammar: {
        title: 'Phản hồi xin lỗi với 没关系 (méi guānxi)',
        formula: '对不起 -> 没关系 / 没事儿',
        explanationVi: 'Mẫu câu thông dụng nhất biểu thị sự bao dung, bỏ qua khi người khác xin lỗi.',
        example1Zh: '对不起！- 没关系。', example1Vi: 'Xin lỗi! - Không sao đâu.',
        example2Zh: '迟到了，对不起！- 没事儿，别担心。', example2Vi: 'Muộn rồi, xin lỗi nhé! - Không sao, đừng lo.',
        example3Zh: '对不起，我忘带书了。- 没关系。', example3Vi: 'Xin lỗi, tớ quên mang sách rồi. - Không sao.',
        quizQuestion: 'Câu trả lời chuẩn khi người khác nói "对不起":',
        quizOptions: JSON.stringify(['不客气', '没关系', '谢谢']),
        quizAnswer: '没关系'
      },
      speaking: {
        title: 'Giải quyết muộn giờ hẹn',
        prompt: 'Đến muộn buổi họp 10 phút, nói lời xin lỗi với đối tác.',
        sampleAnswer: '经理，对不起，今天路上堵车，我迟到了十分钟。- 没关系，请坐吧。'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 28: Từ chối lịch sự',
      description: 'Khéo léo từ chối lời mời khi bận hoặc không tiện tham dự.',
      order: 4,
      vocab: [
        { character: '拒绝', pinyin: 'jùjué', meaningVi: 'Từ chối', exampleZh: '我不喜欢拒绝人。', exampleVi: 'Tôi không thích từ chối người khác.', topic: 'polite' },
        { character: '抱歉', pinyin: 'bàoqiàn', meaningVi: 'Lấy làm tiếc', exampleZh: '非常抱歉，我不能去。', exampleVi: 'Rất tiếc, tôi không thể đi.', topic: 'polite' },
        { character: '方便', pinyin: 'fāngbiàn', meaningVi: 'Thuận tiện', exampleZh: '你现在方便说话吗？', exampleVi: 'Bây giờ bạn tiện nói chuyện không?', topic: 'polite' }
      ],
      grammar: {
        title: 'Từ chối khéo léo bằng 恐怕 (kǒngpà)',
        formula: '恐怕 + Lý do phủ định',
        explanationVi: 'Dùng 恐怕 (e rằng, sợ rằng) để giảm nhẹ sự gay gắt khi phải nói lời từ chối.',
        example1Zh: '今天晚上恐怕不行，我很忙。', example1Vi: 'Tối nay e là không được rồi, tôi rất bận.',
        example2Zh: '我恐怕去不了你的生日会。', example2Vi: 'Tớ e là không đi được tiệc sinh nhật của cậu.',
        example3Zh: '这件事我恐怕帮不上忙。', example3Vi: 'Việc này e là tôi không giúp được gì rồi.',
        quizQuestion: 'Mẫu câu từ chối nhẹ nhàng lịch sự nhất:',
        quizOptions: JSON.stringify(['我不去！', '我恐怕去不了。', '我不喜欢去。']),
        quizAnswer: '我恐怕去不了。'
      },
      speaking: {
        title: 'Từ chối lời mời ăn cơm',
        prompt: 'Bạn của bạn rủ tối nay đi ăn lẩu, từ chối lịch sự vì bạn phải chuẩn bị thi.',
        sampleAnswer: '真抱歉，我明天有汉语考试, 今天晚上恐怕不能和你一起去吃火锅了，下次吧！'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 29: Đi xem phim',
      description: 'Hẹn bạn đi rạp chiếu phim, chọn phim và mua vé.',
      order: 5,
      vocab: [
        { character: '电影', pinyin: 'diànyǐng', meaningVi: 'Phim', exampleZh: '这部电影很好看。', exampleVi: 'Bộ phim này rất hay.', topic: 'entertainment' },
        { character: '电影院', pinyin: 'diànyǐngyuàn', meaningVi: 'Rạp chiếu phim', exampleZh: '我们在电影院门口见。', exampleVi: 'Chúng ta gặp ở cổng rạp phim nhé.', topic: 'entertainment' },
        { character: '门票', pinyin: 'ménpiào', meaningVi: 'Vé xem phim', exampleZh: '我买了两张门票。', exampleVi: 'Tôi đã mua hai chiếc vé.', topic: 'entertainment' }
      ],
      grammar: {
        title: 'Nói về sở thích thích làm gì bằng 喜欢 (xǐhuan)',
        formula: 'Chủ ngữ + 喜欢 + Động từ / Danh từ',
        explanationVi: 'Diễn tả sở thích của bản thân đối với đồ vật hoặc hoạt động giải trí.',
        example1Zh: '我喜欢看中文电影。', example1Vi: 'Tôi thích xem phim Trung Quốc.',
        example2Zh: '你不喜欢吃什么？', example2Vi: 'Bạn không thích ăn cái gì?',
        example3Zh: '他很喜欢去旅游。', example3Vi: 'Anh ấy rất thích đi du lịch.',
        quizQuestion: 'Dịch câu "Tôi thích đi xem phim":',
        quizOptions: JSON.stringify(['我喜欢看电影。', '我喜欢去电影。', '看电影我喜欢。']),
        quizAnswer: '我喜欢看电影。'
      },
      speaking: {
        title: 'Hẹn đi xem phim',
        prompt: 'Rủ bạn gái cuối tuần này đi xem phim hành động mới.',
        sampleAnswer: '这个周末有一部新的电影，你喜欢看吗？我们一起去电影院看吧。'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 30: Hẹn hò người yêu',
      description: 'Giao tiếp tình cảm, hẹn thời gian và địa điểm gặp mặt.',
      order: 6,
      vocab: [
        { character: '约会', pinyin: 'yuēhuì', meaningVi: 'Hẹn hò', exampleZh: '今天晚上我有约会。', exampleVi: 'Tối nay tôi có cuộc hẹn hò.', topic: 'love' },
        { character: '浪漫', pinyin: 'làngmàn', meaningVi: 'Lãng mạn', exampleZh: '法国是一个浪漫的国家。', exampleVi: 'Pháp là một quốc gia lãng mạn.', topic: 'love' },
        { character: '见面', pinyin: 'jiànmiàn', meaningVi: 'Gặp mặt', exampleZh: '我们在哪儿见面？', exampleVi: 'Chúng ta gặp mặt ở đâu?', topic: 'love' }
      ],
      grammar: {
        title: 'Hỏi thời điểm thực hiện với 什么时候 (shénme shíhou)',
        formula: 'Chủ ngữ + 什么时候 + Động từ？',
        explanationVi: 'Dùng để hỏi thời gian chung chung (khi nào, bao giờ) xảy ra hành động.',
        example1Zh: '我们什么时候见面？', example1Vi: 'Khi nào chúng ta gặp nhau?',
        example2Zh: '你什么时候去中国？', example2Vi: 'Bao giờ bạn đi Trung Quốc?',
        example3Zh: '你爸爸什么时候回家？', example3Vi: 'Bố bạn bao giờ về nhà?',
        quizQuestion: 'Dịch câu "Bao giờ bạn có cuộc hẹn?":',
        quizOptions: JSON.stringify(['你什么时候约会？', '你有约会什么？', '什么时候你约会？']),
        quizAnswer: '你什么时候约会？'
      },
      speaking: {
        title: 'Lên lịch hẹn hò',
        prompt: 'Hẹn người yêu tối thứ Sáu đi ăn tối dưới ánh nến lãng mạn.',
        sampleAnswer: '亲爱的，星期五晚上我们去那家法国餐厅约会吧，那里非常浪漫。'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 31: Đến nhà bạn chơi',
      description: 'Giao tiếp khi đến thăm nhà bạn bè, làm khách lịch sự.',
      order: 7,
      vocab: [
        { character: '拜访', pinyin: 'bàifǎng', meaningVi: 'Ghé thăm', exampleZh: '我去拜访一位老朋友。', exampleVi: 'Tôi đi thăm một người bạn cũ.', topic: 'social' },
        { character: '欢迎', pinyin: 'huānyíng', meaningVi: 'Chào mừng', exampleZh: '欢迎你来我家玩！', exampleVi: 'Chào mừng bạn đến nhà tôi chơi!', topic: 'social' },
        { character: '客气', pinyin: 'kèqi', meaningVi: 'Khách sáo', exampleZh: '来就来了，别太客气。', exampleVi: 'Đến thì đến thôi, đừng khách sáo thế.', topic: 'social' }
      ],
      grammar: {
        title: 'Mẫu câu đón tiếp khách 快请进 (kuài qǐng jìn)',
        formula: '欢迎！快请进！',
        explanationVi: 'Cụm từ dùng khi mở cửa đón khách đến nhà chơi để thể hiện sự hiếu khách.',
        example1Zh: '快请进，外面冷。', example1Vi: 'Mau vào trong đi, bên ngoài lạnh.',
        example2Zh: '欢迎光临，快请进！', example2Vi: 'Chào mừng quý khách, xin mời vào!',
        example3Zh: '请坐，快请进。', example3Vi: 'Mời ngồi, mau vào đi.',
        quizQuestion: 'Câu dùng để mời khách vào nhà nhanh chóng là gì?',
        quizOptions: JSON.stringify(['快请进', '快走吧', '别客气']),
        quizAnswer: '快请进'
      },
      speaking: {
        title: 'Chào đón bạn đến nhà',
        prompt: 'Bạn đến chơi nhà, mang theo giỏ quả, hãy chào đón và bảo họ đừng khách sáo.',
        sampleAnswer: '大卫！欢迎欢迎，快请进！来就来了，还买水果，太客气了！'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 32: Giao tiếp trong gia đình',
      description: 'Hỏi han sức khỏe bố mẹ, anh chị em và trò chuyện ấm cúng.',
      order: 8,
      vocab: [
        { character: '沟通', pinyin: 'gōutōng', meaningVi: 'Giao tiếp', exampleZh: '家人之间需要多沟通。', exampleVi: 'Giữa người nhà cần giao tiếp nhiều hơn.', topic: 'family' },
        { character: '家人', pinyin: 'jiārén', meaningVi: 'Người nhà', exampleZh: '我爱我的家人。', exampleVi: 'Tôi yêu gia đình của tôi.', topic: 'family' },
        { character: '关怀', pinyin: 'guānhuái', meaningVi: 'Quan tâm', exampleZh: '谢谢你的关怀。', exampleVi: 'Cảm ơn sự quan tâm của bạn.', topic: 'family' }
      ],
      grammar: {
        title: 'Hỏi han tình hình sức khỏe 身体怎么样？',
        formula: 'Ai đó + 身体怎么样？',
        explanationVi: 'Mẫu câu thăm hỏi sức khỏe của người thân thiết, đặc biệt là người lớn tuổi.',
        example1Zh: '爸爸，您身体怎么样？', example1Vi: 'Bố ơi, sức khỏe bố thế nào ạ?',
        example2Zh: '你最近身体怎么样？', example2Vi: 'Dạo này sức khỏe bạn thế nào?',
        example3Zh: '爷爷身体怎么样？', example3Vi: 'Ông nội sức khỏe thế nào?',
        quizQuestion: 'Dịch câu "Sức khỏe của mẹ bạn thế nào?":',
        quizOptions: JSON.stringify(['你妈妈身体怎么样？', '你妈妈怎么样身体？', '你妈妈好身体？']),
        quizAnswer: '你妈妈身体怎么样？'
      },
      speaking: {
        title: 'Hỏi thăm sức khỏe bố mẹ',
        prompt: 'Gọi điện về nhà hỏi thăm tình hình sức khỏe của bố mẹ dạo này ra sao.',
        sampleAnswer: '妈妈，最近你 và ba 身体怎么样？工作忙不忙？要注意休息。'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 34: Phỏng vấn xin việc',
      description: 'Tự giới thiệu kinh nghiệm làm việc và trả lời nhà tuyển dụng.',
      order: 9,
      vocab: [
        { character: '面试', pinyin: 'miànshì', meaningVi: 'Phỏng vấn', exampleZh: '明天我要去面试。', exampleVi: 'Ngày mai tôi phải đi phỏng vấn.', topic: 'work' },
        { character: '简历', pinyin: 'jiǎnlì', meaningVi: 'CV', exampleZh: '这是我的个人简历。', exampleVi: 'Đây là sơ yếu lý lịch cá nhân của tôi.', topic: 'work' },
        { character: '经验', pinyin: 'jīngyàn', meaningVi: 'Kinh nghiệm', exampleZh: '我有三年工作经验。', exampleVi: 'Tôi có 3 năm kinh nghiệm làm việc.', topic: 'work' }
      ],
      grammar: {
        title: 'Phân biệt năng lực dùng 会 (huì) và 能 (néng)',
        formula: '会 + V vs 能 + V',
        explanationVi: '会 diễn tả kỹ năng biết làm gì qua rèn luyện (tiếng Trung, bơi), 能 diễn tả năng lực thực hiện hành động tại thời điểm nói.',
        example1Zh: '我会说汉语。', example1Vi: 'Tôi biết nói tiếng Trung.',
        example2Zh: '我今天感冒了，不能去上班。', example2Vi: 'Hôm nay tôi cảm cúm, không thể đi làm được.',
        example3Zh: '你能帮我一下吗？', example3Vi: 'Bạn có thể giúp tôi một tay được không?',
        quizQuestion: 'Điền từ phù hợp nói về kỹ năng: "我会说英语。"',
        quizOptions: JSON.stringify(['会', '能', 'Cả hai đều được']),
        quizAnswer: '会'
      },
      speaking: {
        title: 'Phỏng vấn giới thiệu bản thân',
        prompt: 'Nói với nhà tuyển dụng bạn có kinh nghiệm và biết nói tiếng Trung.',
        sampleAnswer: '你好！我是来面试的。我学过两年汉语，会说一点儿中文，我有三年的市场工作经验。'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 35: Đi khám bệnh tiếng Trung',
      description: 'Mô tả triệu chứng đau ốm với bác sĩ tại bệnh viện.',
      order: 10,
      vocab: [
        { character: '生病', pinyin: 'shēngbìng', meaningVi: 'Bị bệnh, ốm', exampleZh: '他生病住院了。', exampleVi: 'Anh ấy bị bệnh nằm viện rồi.', topic: 'health' },
        { character: '头疼', pinyin: 'tóuténg', meaningVi: 'Đau đầu', exampleZh: '我今天有点头疼。', exampleVi: 'Hôm nay tôi hơi đau đầu.', topic: 'health' },
        { character: '检查', pinyin: 'jiǎnchá', meaningVi: 'Khám bệnh', exampleZh: '医生帮我检查一下。', exampleVi: 'Bác sĩ kiểm tra giúp tôi một chút.', topic: 'health' }
      ],
      grammar: {
        title: 'Diễn đạt trạng thái đau bộ phận cơ thể bằng 疼 (téng)',
        formula: 'Bộ phận cơ thể + 疼',
        explanationVi: 'Từ 疼 đóng vai trò làm vị ngữ tính từ để miêu tả cơn đau.',
        example1Zh: '我头疼。', example1Vi: 'Tôi đau đầu.',
        example2Zh: '他肚子疼得厉害。', example2Vi: 'Cậu ấy đau bụng dữ dội.',
        example3Zh: '哪儿疼？', example3Vi: 'Đau chỗ nào?',
        quizQuestion: 'Dịch câu "Tôi bị đau chân":',
        quizOptions: JSON.stringify(['我脚疼。', '我手疼。', '我头疼。']),
        quizAnswer: '我脚疼。'
      },
      speaking: {
        title: 'Khai bệnh với bác sĩ',
        prompt: 'Nói với bác sĩ bạn bị sốt và đau họng từ hôm qua.',
        sampleAnswer: '医生，你好！我从昨天开始发烧，嗓子也很疼，请帮 me check.'
      }
    },
    {
      stageId: commStage4.id,
      title: 'Bài 36: Lời chúc trong tiếng Trung',
      description: 'Mẫu câu chúc mừng năm mới, sinh nhật, công việc thuận lợi.',
      order: 11,
      vocab: [
        { character: '祝', pinyin: 'zhù', meaningVi: 'Chúc', exampleZh: '祝你节日快乐！', exampleVi: 'Chúc bạn kỳ nghỉ vui vẻ!', topic: 'wish' },
        { character: '顺利', pinyin: 'shùnlì', meaningVi: 'Thuận lợi', exampleZh: '祝你工作顺利！', exampleVi: 'Chúc bạn công việc thuận lợi!', topic: 'wish' },
        { character: '幸福', pinyin: 'xìngfú', meaningVi: 'Hạnh phúc', exampleZh: '他们生活很幸福。', exampleVi: 'Cuộc sống của họ rất hạnh phúc.', topic: 'wish' }
      ],
      grammar: {
        title: 'Cấu trúc câu chúc tụng 祝你... (zhù nǐ)',
        formula: '祝 + Đối tượng + Lời chúc',
        explanationVi: 'Động từ 祝 đứng đầu câu để gửi gắm lời chúc tốt đẹp tới người nghe.',
        example1Zh: '祝你万事 như ý！', example1Vi: 'Chúc bạn vạn sự như ý!',
        example2Zh: '祝你们幸福！', example2Vi: 'Chúc các bạn hạnh phúc!',
        example3Zh: '祝您身体健康！', example3Vi: 'Chúc ngài sức khỏe dồi dào!',
        quizQuestion: 'Dịch câu chúc "Chúc bạn công việc thuận lợi":',
        quizOptions: JSON.stringify(['祝你工作顺利。', '祝你工作好。', '祝你工作高兴。']),
        quizAnswer: '祝`你工作顺利。'
      },
      speaking: {
        title: 'Chúc mừng sinh nhật bạn',
        prompt: 'Gửi lời chúc mừng sinh nhật ấm áp tới một người bạn thân.',
        sampleAnswer: '祝你生日快乐！天天开心！身体健康！学习进步！'
      }
    }
  ]

  console.log('Seeding communication lessons, vocab, grammars, and speaking topics...')
  for (const item of commLessonsRaw) {
    const lesson = await prisma.lesson.create({
      data: {
        stageId: item.stageId,
        title: item.title,
        description: item.description,
        order: item.order,
        level: 1, // Unlockable for everyone
      }
    })

    // Seed vocabulary
    for (const v of item.vocab) {
      await prisma.vocabulary.create({
        data: {
          lessonId: lesson.id,
          character: v.character,
          pinyin: v.pinyin,
          meaningVi: v.meaningVi,
          exampleZh: v.exampleZh,
          exampleVi: v.exampleVi,
          hskLevel: 1,
          topic: v.topic,
        }
      })
    }

    // Seed grammar point
    const gp = item.grammar
    await prisma.grammarPoint.create({
      data: {
        lessonId: lesson.id,
        title: gp.title,
        formula: gp.formula,
        explanationVi: gp.explanationVi,
        example1Zh: gp.example1Zh,
        example1Vi: gp.example1Vi,
        example2Zh: gp.example2Zh,
        example2Vi: gp.example2Vi,
        example3Zh: gp.example3Zh,
        example3Vi: gp.example3Vi,
        quizQuestion: gp.quizQuestion,
        quizOptions: gp.quizOptions,
        quizAnswer: gp.quizAnswer,
      }
    })

    // Seed speaking topic
    const st = item.speaking
    await prisma.speakingTopic.create({
      data: {
        lessonId: lesson.id,
        title: st.title,
        prompt: st.prompt,
        sampleAnswer: st.sampleAnswer,
        prepTime: 15,
        recordTime: 90,
      }
    })

    // Seed a basic Quiz
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: lesson.id,
        title: `Kiểm tra ${item.title}`,
        description: `Luyện tập phản xạ từ vựng và cấu trúc ngữ pháp của ${item.title}.`
      }
    })

    // Seed 3 questions for this quiz
    const firstVocab = item.vocab[0]
    const secondVocab = item.vocab[1]
    
    await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: `Chữ Hán của từ "${firstVocab.meaningVi}" là:`,
        questionType: 'vocabulary',
        options: JSON.stringify([firstVocab.character, secondVocab.character, '其他', '没有']),
        correctAnswer: firstVocab.character
      }
    })

    await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: `Phiên âm Pinyin của từ "${secondVocab.character}" là:`,
        questionType: 'vocabulary',
        options: JSON.stringify([secondVocab.pinyin, firstVocab.pinyin, 'qítā', 'mèiyǒu']),
        correctAnswer: secondVocab.pinyin
      }
    })

    await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: gp.quizQuestion,
        questionType: 'grammar',
        options: gp.quizOptions,
        correctAnswer: gp.quizAnswer
      }
    })
  }
  console.log('Seeded communication roadmaps, stages, and lessons successfully!')


  // 12. Seed progress for mock student to show stats immediately
  await prisma.userProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson1.id,
      completed: true,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // completed 1 day ago
    },
  })

  await prisma.userProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson2.id,
      completed: true,
      completedAt: new Date(), // completed today
    },
  })

  // Seed some flashcard reviews for student
  const studentVocabs = await prisma.vocabulary.findMany({ take: 5 })
  for (const sv of studentVocabs) {
    await prisma.flashcardReview.create({
      data: {
        userId: student.id,
        vocabularyId: sv.id,
        status: 'learning',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Database seeding successfully finished!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
