// src/app/api/dashboard/daily-missions/route.ts
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
        points: true,
        streak: true,
        dailyMissions: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Local midnight start
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // 1. Vocabulary learned/reviewed today
    const vocabCount = await prisma.flashcardReview.count({
      where: {
        userId: session.userId,
        updatedAt: {
          gte: startOfToday,
        },
      },
    })

    // 2. Quiz results completed today
    const quizCount = await prisma.quizResult.count({
      where: {
        userId: session.userId,
        createdAt: {
          gte: startOfToday,
        },
      },
    })

    // 3. Speaking recordings completed today
    const speakCount = await prisma.speakingRecording.count({
      where: {
        userId: session.userId,
        createdAt: {
          gte: startOfToday,
        },
      },
    })

    // 4. Lessons completed today
    const lessonCount = await prisma.userProgress.count({
      where: {
        userId: session.userId,
        completed: true,
        completedAt: {
          gte: startOfToday,
        },
      },
    })

    // Calculate level and points progression
    // level = Math.floor(points / 100) + 1
    const points = user.points
    const level = Math.floor(points / 100) + 1
    const xpInLevel = points % 100
    const nextLevelXp = 100

    const missions = [
      { id: 'vocab', name: 'Học 10 từ mới', current: vocabCount, target: 10, completed: vocabCount >= 10 },
      { id: 'quiz', name: 'Hoàn thành 1 bài kiểm tra', current: quizCount, target: 1, completed: quizCount >= 1 },
      { id: 'speak', name: 'Luyện nói HSKK 1 câu', current: speakCount, target: 1, completed: speakCount >= 1 },
      { id: 'lesson', name: 'Học 1 bài học mới', current: lessonCount, target: 1, completed: lessonCount >= 1 },
    ]

    return NextResponse.json({
      success: true,
      missions,
      streak: user.streak,
      points: user.points,
      level,
      xpInLevel,
      nextLevelXp,
    })
  } catch (error) {
    console.error('API Daily Missions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
