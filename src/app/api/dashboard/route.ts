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

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // Parallelize independent database queries to avoid sequential query bottleneck
    const [
      user,
      totalLessonsCount,
      completedLessonsCount,
      wordsLearned,
      completedLessonIds,
      vocabCountToday,
      quizCountToday,
      speakCountToday,
      lessonCountToday
    ] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          email: true,
          hskLevel: true,
          learningGoal: true,
          streak: true,
          points: true,
          role: true,
          subscription: true,
        },
      }),
      prisma.lesson.count(),
      prisma.userProgress.count({
        where: {
          userId: session.userId,
          completed: true,
        },
      }),
      prisma.flashcardReview.count({
        where: {
          userId: session.userId,
          status: { in: ['learning', 'mastered'] },
        },
      }),
      prisma.userProgress.findMany({
        where: {
          userId: session.userId,
          completed: true,
        },
        select: { lessonId: true },
      }).then(list => list.map(item => item.lessonId)),
      prisma.flashcardReview.count({
        where: {
          userId: session.userId,
          updatedAt: { gte: startOfToday },
        },
      }),
      prisma.quizResult.count({
        where: {
          userId: session.userId,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.speakingRecording.count({
        where: {
          userId: session.userId,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.userProgress.count({
        where: {
          userId: session.userId,
          completed: true,
          completedAt: { gte: startOfToday },
        },
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const progressPercent = totalLessonsCount > 0 
      ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
      : 0

    // Suggest a lesson: find the first lesson of user's HSK level that they haven't completed
    let suggestedLesson = null
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

    // Process daily missions data (same calculation as daily-missions endpoint)
    const points = user.points
    const level = Math.floor(points / 100) + 1
    const xpInLevel = points % 100
    const nextLevelXp = 100

    const missions = [
      { id: 'vocab', name: 'Học 10 từ mới', current: vocabCountToday, target: 10, completed: vocabCountToday >= 10 },
      { id: 'quiz', name: 'Hoàn thành 1 bài kiểm tra', current: quizCountToday, target: 1, completed: quizCountToday >= 1 },
      { id: 'speak', name: 'Luyện nói HSKK 1 câu', current: speakCountToday, target: 1, completed: speakCountToday >= 1 },
      { id: 'lesson', name: 'Học 1 bài học mới', current: lessonCountToday, target: 1, completed: lessonCountToday >= 1 },
    ]

    return NextResponse.json({
      user,
      progressPercent,
      lessonsCompleted: completedLessonsCount,
      totalLessons: totalLessonsCount,
      wordsLearned,
      suggestedLesson,
      missionsData: {
        success: true,
        missions,
        streak: user.streak,
        points: user.points,
        level,
        xpInLevel,
        nextLevelXp,
      }
    })
  } catch (error) {
    console.error('API Dashboard error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
