// src/app/api/placement-test/submit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession, signJWT, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { score, totalQuestions } = await req.json()

    if (score === undefined || totalQuestions === undefined) {
      return NextResponse.json({ error: 'Score and totalQuestions are required' }, { status: 400 })
    }

    // Determine HSK level recommendation based on placement test score
    let hskLevelRecommendation = 1
    const pct = (score / totalQuestions) * 100

    if (pct >= 80) {
      hskLevelRecommendation = 3 // Recommend HSK 3 (Pre-intermediate)
    } else if (pct >= 50) {
      hskLevelRecommendation = 2 // Recommend HSK 2 (Elementary)
    } else {
      hskLevelRecommendation = 1 // Start from HSK 1 (Beginner)
    }

    // Update user profile in database
    const updatedUser = await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        hskLevel: hskLevelRecommendation,
        placementCompleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        hskLevel: true,
        role: true,
        placementCompleted: true
      }
    })

    // Auto-complete lessons of lower levels so they are skipped/marked completed on the roadmap
    if (hskLevelRecommendation > 1) {
      const lessonsToComplete = await prisma.lesson.findMany({
        where: {
          level: {
            lt: hskLevelRecommendation
          }
        },
        select: {
          id: true
        }
      })

      if (lessonsToComplete.length > 0) {
        // Query existing progress records to avoid unique constraint violations on SQLite
        const existingProgress = await prisma.userProgress.findMany({
          where: {
            userId: session.userId,
            lessonId: {
              in: lessonsToComplete.map(l => l.id)
            }
          },
          select: {
            lessonId: true
          }
        })
        const existingLessonIds = new Set(existingProgress.map(p => p.lessonId))
        const lessonsToInsert = lessonsToComplete.filter(l => !existingLessonIds.has(l.id))

        if (lessonsToInsert.length > 0) {
          const progressData = lessonsToInsert.map(lesson => ({
            userId: session.userId,
            lessonId: lesson.id,
            completed: true,
            completedAt: new Date()
          }))

          await prisma.userProgress.createMany({
            data: progressData
          })
        }
      }
    }

    // Sign a new JWT with updated placementCompleted flag
    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      placementCompleted: true,
    })

    const response = NextResponse.json({
      success: true,
      user: updatedUser,
      recommendedLevel: hskLevelRecommendation,
      percentage: pct
    })

    // Set cookie valid for 7 days
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('API Placement Test submit error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
