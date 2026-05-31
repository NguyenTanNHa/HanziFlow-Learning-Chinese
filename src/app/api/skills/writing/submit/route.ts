// src/app/api/skills/writing/submit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      writingTaskId, 
      content, 
      isVocabularyChecked, 
      isGrammarChecked, 
      isSentenceCountChecked,
      teacherScore,
      teacherFeedback
    } = await req.json()

    if (!writingTaskId || !content) {
      return NextResponse.json({ error: 'writingTaskId and content are required' }, { status: 400 })
    }

    // Save WritingSubmission with AI evaluation mapped as teacher comments
    const submission = await prisma.writingSubmission.create({
      data: {
        userId: session.userId,
        writingTaskId,
        content,
        isVocabularyChecked: !!isVocabularyChecked,
        isGrammarChecked: !!isGrammarChecked,
        isSentenceCountChecked: !!isSentenceCountChecked,
        teacherScore: teacherScore !== undefined ? Number(teacherScore) : null,
        teacherFeedback: teacherFeedback || null,
        reviewedAt: teacherScore !== undefined ? new Date() : null,
      },
    })

    // Award XP: +20 XP for essay writing practice
    const pointsAwarded = 20
    await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: pointsAwarded },
      },
    })

    return NextResponse.json({
      success: true,
      submission,
      pointsAwarded,
    })
  } catch (error) {
    console.error('API Save Writing Submission error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return the list of user submissions for history
    const submissions = await prisma.writingSubmission.findMany({
      where: { userId: session.userId },
      include: {
        writingTask: {
          select: {
            title: true,
            prompt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('API Get Writing Submissions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
