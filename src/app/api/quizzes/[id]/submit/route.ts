export const dynamic = 'force-dynamic'
// src/app/api/quizzes/[id]/submit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch quiz structure
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Map questions options JSON strings to arrays
    const formattedQuestions = quiz.questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
    }))

    return NextResponse.json({
      quiz: {
        ...quiz,
        questions: formattedQuestions,
      },
    })
  } catch (error) {
    console.error('API Quiz Get error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { answers } = await req.json() // Mapping of questionId -> selectedAnswer text

    if (!answers) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    // Fetch quiz questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    let score = 0
    const maxScore = quiz.questions.length
    const wrongTypes = new Set<string>()

    // Check answers
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      if (isCorrect) {
        score += 1
      } else {
        wrongTypes.add(question.questionType)
      }
    })

    // Generate dynamic feedback suggestion
    let recommendation = 'Tuyệt vời! Bạn đã làm rất tốt bài kiểm tra này. Hãy tiếp tục học bài tiếp theo!'
    if (score < maxScore) {
      const typesList = Array.from(wrongTypes)
      const VietnameseTypes: Record<string, string> = {
        vocabulary: 'từ vựng',
        grammar: 'ngữ pháp',
        listening: 'nghe hiểu',
        reading: 'luyện đọc',
      }
      const suggestions = typesList.map(t => VietnameseTypes[t] || t).join(', ')
      recommendation = `Bạn đã hoàn thành tốt, tuy nhiên cần ôn tập thêm về các phần: ${suggestions}. Hãy sử dụng Flashcard và xem lại cấu trúc ngữ pháp tương ứng nhé.`
    }

    // Save result to DB
    const result = await prisma.quizResult.create({
      data: {
        quizId,
        userId: session.userId,
        score,
        maxScore,
        answers: JSON.stringify(answers),
        recommendation,
      },
    })

    // Award score points: 10 XP base + 10 XP for each correct answer
    const pointsToAward = 10 + score * 10
    await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: pointsToAward },
      },
    })

    return NextResponse.json({
      success: true,
      resultId: result.id,
      score,
      maxScore,
      recommendation,
      pointsAwarded: pointsToAward,
    })
  } catch (error) {
    console.error('API Quiz Submit error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
