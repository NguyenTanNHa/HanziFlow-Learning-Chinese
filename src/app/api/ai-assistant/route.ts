export const dynamic = 'force-dynamic'
// src/app/api/ai-assistant/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tích hợp giới hạn tần suất gọi API AI (Rate Limiting)
    const limitMax = session.subscription === 'pro' ? 5 : 3
    const rateCheck = rateLimit(`ai_assistant_${session.userId}`, { windowMs: 60 * 1000, max: limitMax })
    if (!rateCheck.success) {
      return NextResponse.json({
        replyChinese: '⚠️ Thao tác quá nhanh.',
        replyPinyin: 'Nín cào zuò tài kuài le, qǐng shāo hòu zài shì.',
        replyVietnamese: `Bạn đang gửi câu hỏi quá nhanh. Vui lòng đợi một lát trước khi gửi tiếp (Giới hạn tối đa: ${limitMax} câu hỏi/phút).`,
        suggestions: [],
        limitReached: true
      }, { status: 429 })
    }


    const { message, history, image, imageType } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Fetch user details
    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch user's weak vocabulary reviews (status = learning)
    const weakReviews = await prisma.flashcardReview.findMany({
      where: {
        userId: session.userId,
        status: 'learning',
      },
      include: {
        vocabulary: true,
      },
      take: 5,
    })

    const weakWordsText = weakReviews
      .map(r => `${r.vocabulary.character} (${r.vocabulary.pinyin}: ${r.vocabulary.meaningVi})`)
      .join(', ')

    // Parse daily missions JSON to track AI assistant usage
    let missionsObj: any = {}
    try {
      missionsObj = JSON.parse(user.dailyMissions || '{}')
    } catch (_) {
      missionsObj = {}
    }

    const todayStr = new Date().toISOString().split('T')[0]
    if (missionsObj.date !== todayStr) {
      missionsObj = {
        date: todayStr,
        words: 0,
        quiz: 0,
        speak: 0,
        lesson: 0,
        aiChats: 0
      }
    }

    // Check plan limits
    const isPro = user.subscription === 'pro'
    const chatCount = missionsObj.aiChats || 0

    if (!isPro && chatCount >= 3) {
      return NextResponse.json({
        replyChinese: '⚠️ Gói Miễn Phí đã hết lượt hỏi hôm nay.',
        replyPinyin: 'Bạn đã sử dụng hết 3/3 lượt hỏi miễn phí trong ngày.',
        replyVietnamese: 'Hãy nâng cấp lên tài khoản HanziFlow Pro để có thể trò chuyện không giới hạn với AI Tutor và mở khóa toàn bộ tính năng học nâng cao!',
        suggestions: [],
        limitReached: true
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured on server.' }, { status: 500 })
    }

    // Format chat history
    let historyText = ""
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-8)
      historyText = recentHistory.map((m: any) => {
        const role = m.sender === 'user' ? 'Học viên' : 'AI Tutor'
        const content = m.chinese || m.text || ""
        return `${role}: ${content}`
      }).join('\n')
    }

    const promptText = `
    Bạn là một trợ lý đàm thoại tiếng Trung (AI Tutor) kiên nhẫn, kiêm giáo viên giải bài tập thông minh.
    Nhiệm vụ của bạn là trò chuyện với học viên bằng tiếng Trung hoặc giải đáp các thắc mắc về từ vựng, ngữ pháp tiếng Trung của họ (bằng tiếng Việt).

    THÔNG TIN HỌC VIÊN:
    - Trình độ HSK hiện tại: HSK ${user.hskLevel}
    - Định hướng học tập: ${user.learningGoal || 'Luyện thi HSK'}
    - Từ vựng học viên đang học yếu (cần ôn tập): ${weakWordsText || 'Đã thuộc hết từ vựng hoặc chưa học từ nào'}

    HÃY ĐÓNG VAI TRÒ TÙY THEO ĐẦU VÀO CỦA HỌC VIÊN:

    1. NẾU HỌC VIÊN GỬI KÈM HÌNH ẢNH (Ảnh chụp bài viết tay chữ Hán, ảnh chụp đề bài bài tập, giáo trình...):
       - Phân tích hình ảnh bằng thị giác AI. Nhận diện các chữ viết tiếng Trung có trong ảnh (OCR).
       - Dịch nghĩa phần chữ trong ảnh sang tiếng Việt.
       - Sửa tất cả các lỗi sai nét viết, lỗi chính tả chữ Hán, hoặc lỗi cấu trúc ngữ pháp (nếu là bài tập viết của học viên).
       - Giải thích đáp án chi tiết và cấu trúc ngữ pháp liên quan bằng tiếng Việt dễ hiểu.
       - Trả về câu trả lời chính (giải thích bài tập) trong trường "replyChinese". 
       - Gợi ý 3 câu phản xạ nhanh liên quan đến việc đặt câu thực hành hoặc hỏi tiếp ở phần suggestions.

    2. NẾU HỌC VIÊN MUỐN TRÒ CHUYỆN (Không gửi kèm ảnh):
       - Trả lời bằng tiếng Trung tự nhiên, ngắn gọn (phù hợp trình độ HSK ${user.hskLevel}).
       - Thỉnh thoảng lồng ghép khéo léo các từ vựng học viên đang học yếu để giúp họ ôn tập tự nhiên.
       - Đặt thêm một câu hỏi tiếng Trung ngắn gọn để dẫn dắt câu chuyện tiếp tục.
       - Cung cấp phiên âm Pinyin và dịch nghĩa tiếng Việt cho câu trả lời của bạn.
       - Gợi ý 3 câu trả lời nhanh (suggestions) để họ lựa chọn trả lời tiếp.

    3. NẾU HỌC VIÊN HỎI NGỮ PHÁP/TỪ VỰNG THƯỜNG (Không gửi kèm ảnh):
       - Giải thích chi tiết bằng tiếng Việt trong trường "replyChinese".
       - Cung cấp ví dụ minh họa và gợi ý thực hành ở suggestions.

    Lịch sử trò chuyện gần đây (được sắp xếp theo thứ tự thời gian):
    ${historyText}

    Tin nhắn mới nhất từ học viên: "${message}"

    BẮT BUỘC TRẢ VỀ KẾT QUẢ DƯỚI ĐỊNH DẠNG JSON với cấu trúc chính xác như sau:
    {
      "replyChinese": "nội dung phản hồi bằng tiếng Trung chữ Hán giản thể (hoặc phần giải thích bài tập, giải thích chi tiết tiếng Việt nếu gửi kèm ảnh/hỏi nghĩa từ vựng)",
      "replyPinyin": "phiên âm Pinyin cho phần chữ tiếng Trung ở trên (nếu là bài giải thích bằng tiếng Việt, bạn có thể để trống hoặc chỉ ghi Pinyin cho phần câu tiếng Trung ví dụ)",
      "replyVietnamese": "dịch nghĩa tiếng Việt cho phần câu tiếng Trung ở trên (nếu là bài giải bằng tiếng Việt, bạn ghi tóm tắt lời khuyên học tập ở đây)",
      "suggestions": [
        {
          "zh": "Câu gợi ý phản xạ 1 bằng tiếng Trung",
          "pinyin": "Phiên âm Pinyin 1",
          "vi": "Dịch tiếng Việt 1"
        },
        {
          "zh": "Câu gợi ý phản xạ 2 bằng tiếng Trung",
          "pinyin": "Phiên âm Pinyin 2",
          "vi": "Dịch tiếng Việt 2"
        },
        {
          "zh": "Câu gợi ý phản xạ 3 bằng tiếng Trung",
          "pinyin": "Phiên âm Pinyin 3",
          "vi": "Dịch tiếng Việt 3"
        }
      ]
    }

    Lưu ý quan trọng:
    - Trả về JSON thuần túy, không bao quanh bằng dấu \`\`\`json hay bất kỳ ký tự nào khác ngoài JSON.
    - Đảm bảo các thuộc tính JSON đều tồn tại và đúng kiểu dữ liệu.
    `

    // Build the request parts for Gemini (Multimodal support)
    const promptParts: any[] = [{ text: promptText }]

    if (image && imageType) {
      promptParts.push({
        inlineData: {
          mimeType: imageType,
          data: image // Base64 string from client
        }
      })
    }

    // Call Gemini API 2.0 Flash using raw fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: promptParts
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    })

    let aiChatsUpdate = chatCount
    let replyChinese = ""
    let replyPinyin = ""
    let replyVietnamese = ""
    let suggestions = []

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error details:', errText)
      // Fallback
      replyChinese = "我今天有点累，能稍后再聊吗？"
      replyPinyin = "Wǒ jīntiān yǒudiǎn lèi, néng shāohòu zài liáo ma?"
      replyVietnamese = "Hôm nay tôi hơi mệt, chúng ta có thể nói chuyện sau được không? (Lỗi kết nối AI)"
      suggestions = [
        { zh: "好的，没关系。", pinyin: "Hǎo de, méi guānxi.", vi: "Được rồi, không sao." },
        { zh: "再见！", pinyin: "Zàijiàn!", vi: "Tạm biệt!" },
        { zh: "你好好休息。", pinyin: "Nǐ hǎohǎo xiūxi.", vi: "Bạn nghỉ ngơi tốt nhé." }
      ]
    } else {
      const resData = await response.json()
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text

      if (!rawText) {
        throw new Error('No text returned from Gemini API')
      }

      try {
        const parsed = JSON.parse(rawText.trim())
        replyChinese = parsed.replyChinese || ""
        replyPinyin = parsed.replyPinyin || ""
        replyVietnamese = parsed.replyVietnamese || ""
        suggestions = parsed.suggestions || []
        
        // Only increment counter if API call succeeded
        aiChatsUpdate = chatCount + 1
      } catch (parseErr) {
        console.error('Parse JSON Error from Gemini response:', rawText, parseErr)
        replyChinese = "对不起，我没听懂，可以再说一遍吗？"
        replyPinyin = "Duìbuqǐ, wǒ méi tīngdǒng, kěyǐ zài shuō yí biàn ma?"
        replyVietnamese = "Xin lỗi, tôi chưa hiểu rõ lắm, bạn có thể nói lại lần nữa được không? (Lỗi xử lý phản hồi)"
        suggestions = [
          { zh: "好的，我再说一遍。", pinyin: "Hǎo de, wǒ zài shuō yí biàn.", vi: "Được rồi, tôi sẽ nói lại." },
          { zh: "我们聊点别的吧。", pinyin: "Wǒmen liáo diǎn bié de ba.", vi: "Chúng ta nói chuyện khác đi." }
        ]
      }
    }

    // Update user profile with new chat count
    missionsObj.aiChats = aiChatsUpdate
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        dailyMissions: JSON.stringify(missionsObj)
      }
    })

    return NextResponse.json({
      replyChinese,
      replyPinyin,
      replyVietnamese,
      suggestions,
      aiChatsToday: missionsObj.aiChats,
      limitReached: false
    })

  } catch (error) {
    console.error('API AI Assistant error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
