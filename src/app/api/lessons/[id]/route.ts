// src/app/api/lessons/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch lesson with all components
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        vocabularies: true,
        grammars: true,
        listening: true,
        reading: true,
        speaking: true,
        writing: true,
        quizzes: {
          select: { id: true, title: true, description: true },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Subscription check: Free tier is restricted to HSK 1
    if (lesson.level > 1) {
      const user = await prisma.userProfile.findUnique({
        where: { id: session.userId },
        select: { subscription: true },
      })
      if (!user || user.subscription === 'free') {
        return NextResponse.json({ 
          error: 'Upgrade to Pro to access HSK 2-6 lessons.', 
          requiresUpgrade: true 
        }, { status: 403 })
      }
    }

    // Fetch user completion progress for this lesson
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        },
      },
    })

    return NextResponse.json({
      lesson,
      isCompleted: progress ? progress.completed : false,
    })
  } catch (error) {
    console.error('API Lesson Detail error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
