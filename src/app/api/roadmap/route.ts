// src/app/api/roadmap/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all roadmaps with stages and lessons
    const roadmaps = await prisma.roadmap.findMany({
      orderBy: { level: 'asc' },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    // Fetch user progress
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        completed: true,
      },
      select: { lessonId: true },
    })

    const completedLessonIds = progress.map(p => p.lessonId)

    // Fetch user profile to check unlocked levels
    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: { hskLevel: true }
    })
    const userHskLevel = user?.hskLevel || 1

    // Build progress-mapped roadmap structure
    const mappedRoadmaps = roadmaps.map(roadmap => {
      return {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        level: roadmap.level,
        stages: roadmap.stages.map(stage => {
          return {
            id: stage.id,
            title: stage.title,
            description: stage.description,
            order: stage.order,
            lessons: stage.lessons.map(lesson => {
              const isCompleted = completedLessonIds.includes(lesson.id)
              const isUnlocked = lesson.level <= userHskLevel
              return {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                order: lesson.order,
                level: lesson.level,
                isCompleted,
                isUnlocked,
              }
            }),
          }
        }),
      }
    })

    return NextResponse.json({ roadmaps: mappedRoadmaps })
  } catch (error) {
    console.error('API Roadmap error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
