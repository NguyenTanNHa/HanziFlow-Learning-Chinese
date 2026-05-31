// src/app/api/vocabulary/review/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vocabularyId, rating } = await req.json()

    if (!vocabularyId || !rating) {
      return NextResponse.json({ error: 'VocabularyId and rating are required' }, { status: 400 })
    }

    // Fetch user details for subscription and hearts tracking
    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: { id: true, subscription: true, dailyMissions: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Subscription check: Free tier is limited to 5 vocabulary reviews/day
    // (Bypass check for dummy tracking IDs from speaking/writing evaluations)
    if (vocabularyId !== 'writing-draft-dummy' && vocabularyId !== 'speaking-eval-dummy') {
      if (user.subscription === 'free') {
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        
        const countToday = await prisma.flashcardReview.count({
          where: {
            userId: session.userId,
            updatedAt: { gte: startOfToday },
          },
        })

        if (countToday >= 5) {
          return NextResponse.json({
            error: 'Bạn đã đạt giới hạn 5 lượt ôn tập từ vựng hôm nay trong gói Miễn phí. Hãy nâng cấp lên Pro để ôn tập không giới hạn!',
            limitReached: true,
          }, { status: 403 })
        }
      }
    }

    // Fetch existing review record
    const existingReview = await prisma.flashcardReview.findUnique({
      where: {
        userId_vocabularyId: {
          userId: session.userId,
          vocabularyId,
        },
      },
    })

    const prevEaseFactor = existingReview?.easeFactor ?? 2.5
    const prevRepetitions = existingReview?.repetitions ?? 0
    const prevInterval = existingReview?.interval ?? 0

    let q = 4 // Default q=4 (Good)
    let pointsAwarded = 3

    if (rating === 'again') {
      q = 1
      pointsAwarded = 1
    } else if (rating === 'hard') {
      q = 3
      pointsAwarded = 2
    } else if (rating === 'good') {
      q = 4
      pointsAwarded = 3
    } else if (rating === 'easy') {
      q = 5
      pointsAwarded = 5
    } else if (rating === 'mastered') {
      q = 4
      pointsAwarded = 5 // Bonus XP for legacy mastered rating
    }

    let nextRepetitions = 0
    let nextInterval = 0

    if (q < 3) {
      nextRepetitions = 0
      nextInterval = 1 // Review in 1 day (or same-day session)
    } else {
      nextRepetitions = prevRepetitions + 1
      if (nextRepetitions === 1) {
        nextInterval = 1 // 1 day
      } else if (nextRepetitions === 2) {
        nextInterval = 6 // 6 days
      } else {
        nextInterval = Math.round(prevInterval * prevEaseFactor)
      }

      if (nextInterval <= 0) nextInterval = 1
    }

    // Calculate new Ease Factor (EF)
    let nextEaseFactor = prevEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if (nextEaseFactor < 1.3) {
      nextEaseFactor = 1.3
    }

    // Determine status
    let status = 'learning'
    if (q >= 4) {
      status = 'mastered'
    }

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)
    nextReviewDate.setHours(0, 0, 0, 0) // Start of day

    // Upsert FlashcardReview
    const review = await prisma.flashcardReview.upsert({
      where: {
        userId_vocabularyId: {
          userId: session.userId,
          vocabularyId,
        },
      },
      update: {
        status,
        interval: nextInterval,
        repetitions: nextRepetitions,
        easeFactor: nextEaseFactor,
        nextReview: nextReviewDate,
      },
      create: {
        userId: session.userId,
        vocabularyId,
        status,
        interval: nextInterval,
        repetitions: nextRepetitions,
        easeFactor: nextEaseFactor,
        nextReview: nextReviewDate,
      },
    })

    // Update user profile (award XP & restore 1 Heart if rating is Good, Easy, or Mastered)
    let heartsRestored = false
    let updatedHearts = 5

    if ((rating === 'mastered' || q >= 4) && user.subscription !== 'pro') {
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
          words: missionsObj.words || 0,
          quiz: missionsObj.quiz || 0,
          speak: missionsObj.speak || 0,
          lesson: missionsObj.lesson || 0,
          aiChats: missionsObj.aiChats || 0,
          hearts: 5
        }
      }

      if (missionsObj.hearts === undefined) {
        missionsObj.hearts = 5
      }

      if (missionsObj.hearts < 5) {
        missionsObj.hearts += 1
        heartsRestored = true
      }
      updatedHearts = missionsObj.hearts

      await prisma.userProfile.update({
        where: { id: session.userId },
        data: {
          points: { increment: pointsAwarded },
          dailyMissions: JSON.stringify(missionsObj)
        }
      })
    } else {
      // Standard XP award only
      await prisma.userProfile.update({
        where: { id: session.userId },
        data: {
          points: { increment: pointsAwarded }
        }
      })
    }

    return NextResponse.json({
      success: true,
      review,
      pointsAwarded,
      heartsRestored,
      currentHearts: user.subscription === 'pro' ? 999 : updatedHearts
    })
  } catch (error) {
    console.error('API Vocabulary Review error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
