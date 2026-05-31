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

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10)

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
