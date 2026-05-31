export const dynamic = 'force-dynamic'
// src/app/api/skills/writing/ai-evaluate/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { writingTaskId, content } = await req.json()

    if (!writingTaskId || !content) {
      return NextResponse.json({ error: 'writingTaskId and content are required' }, { status: 400 })
    }

    // Fetch the task details to get the prompt
    const task = await prisma.writingTask.findUnique({
      where: { id: writingTaskId }
    })

    if (!task) {
      return NextResponse.json({ error: 'Writing task not found' }, { status: 404 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured on server.' }, { status: 500 })
    }

    const promptText = `
    Bạn là một giáo viên tiếng Trung chấm điểm viết HSK.
    Hãy phân tích và chấm điểm bài viết tiếng Trung sau đây của học viên:

    ĐỀ BÀI YÊU CẦU: "${task.prompt}"
    BÀI VIẾT CỦA HỌC VIÊN: "${content}"

    Yêu cầu phân tích chi tiết:
    1. Kiểm tra chính tả chữ Hán, cấu trúc câu ngữ pháp sai, và cách diễn đạt chưa tự nhiên.
    2. Đề xuất phiên bản viết lại (improvedVersion) hoàn chỉnh tự nhiên hơn, sửa tất cả các lỗi sai.
    3. Đưa ra điểm số khách quan (score) trên thang điểm 10 (từ 1 đến 10), tương thích với thang điểm chấm viết HSKK/HSK.
    4. Nhận xét tổng quan (feedback) bằng tiếng Việt có ích, khích lệ người học.

    Bắt buộc trả về kết quả dưới định dạng JSON với cấu trúc chuẩn sau:
    {
      "score": number (1 đến 10),
      "feedback": "Nhận xét tổng quát bằng tiếng Việt",
      "grammarErrors": [
        {
          "original": "câu viết sai gốc của học viên",
          "corrected": "câu đã sửa đúng ngữ pháp",
          "explanation": "giải thích ngắn lỗi sai và lý do sửa bằng tiếng Việt"
        }
      ],
      "improvedVersion": "phiên bản viết lại tự nhiên hoàn chỉnh"
    }
    `

    // Call Gemini API 2.0 Flash using raw fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error details:', errText)
      return NextResponse.json({ error: 'Lỗi khi gọi AI chấm điểm. Vui lòng thử lại sau.' }, { status: 502 })
    }

    const resData = await response.json()
    const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      return NextResponse.json({ error: 'AI không trả về phản hồi hợp lệ.' }, { status: 502 })
    }

    // Parse the JSON response from Gemini
    const evaluation = JSON.parse(rawText.trim())

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error: any) {
    console.error('API AI Writing Evaluate Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
