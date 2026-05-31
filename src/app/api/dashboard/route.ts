export const dynamic = 'force-dynamic'
// src/app/api/dashboard/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile
    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        hskLevel: true,
        learningGoal: true,
        streak: true,
        points: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Calculate total lessons vs completed lessons
    const totalLessonsCount = await prisma.lesson.count()
    const completedLessonsCount = await prisma.userProgress.count({
      where: {
        userId: session.userId,
        completed: true,
      },
    })

    const progressPercent = totalLessonsCount > 0 
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
      : 0

    // Count learned vocabulary (either in "learning" or "mastered" state)
    const wordsLearned = await prisma.flashcardReview.count({
      where: {
        userId: session.userId,
        status: { in: ['learning', 'mastered'] },
      },
    })

    // Suggest a lesson: find the first lesson of user's HSK level that they haven't completed
    // If all are completed, find any uncompleted lesson, or return the last lesson.
    let suggestedLesson = null
    const completedLessonIds = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        completed: true,
      },
      select: { lessonId: true },
    }).then(list => list.map(item => item.lessonId))

    const nextUncompletedLesson = await prisma.lesson.findFirst({
      where: {
        level: user.hskLevel,
        id: { notIn: completedLessonIds },
      },
      orderBy: [
        { stage: { order: 'asc' } },
        { order: 'asc' },
      ],
      include: {
        stage: { select: { title: true } },
      },
    })

    if (nextUncompletedLesson) {
      suggestedLesson = {
        id: nextUncompletedLesson.id,
        title: nextUncompletedLesson.title,
        description: nextUncompletedLesson.description,
        level: nextUncompletedLesson.level,
        stageTitle: nextUncompletedLesson.stage.title,
      }
    } else {
      // Fallback: look for any uncompleted lesson in the database
      const fallbackLesson = await prisma.lesson.findFirst({
        where: {
          id: { notIn: completedLessonIds },
        },
        orderBy: [
          { level: 'asc' },
          { stage: { order: 'asc' } },
          { order: 'asc' },
        ],
        include: {
          stage: { select: { title: true } },
        },
      })

      if (fallbackLesson) {
        suggestedLesson = {
          id: fallbackLesson.id,
          title: fallbackLesson.title,
          description: fallbackLesson.description,
          level: fallbackLesson.level,
          stageTitle: fallbackLesson.stage.title,
        }
      } else {
        // If all lessons in database are completed, return the last completed one or null
        const lastLesson = await prisma.lesson.findFirst({
          orderBy: [
            { level: 'desc' },
            { order: 'desc' },
          ],
          include: {
            stage: { select: { title: true } },
          },
        })
        if (lastLesson) {
          suggestedLesson = {
            id: lastLesson.id,
            title: lastLesson.title,
            description: lastLesson.description,
            level: lastLesson.level,
            stageTitle: lastLesson.stage.title,
          }
        }
      }
    }

    return NextResponse.json({
      user,
      progressPercent,
      lessonsCompleted: completedLessonsCount,
      totalLessons: totalLessonsCount,
      wordsLearned,
      suggestedLesson,
    })
  } catch (error) {
    console.error('API Dashboard error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
