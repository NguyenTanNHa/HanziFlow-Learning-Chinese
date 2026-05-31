export const dynamic = 'force-dynamic'
// src/app/api/vocabulary/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level')
    const topic = searchParams.get('topic')
    const dueOnly = searchParams.get('dueOnly')

    // Prepare filter options
    const whereClause: any = {}
    if (level) {
      whereClause.hskLevel = Number(level)
    }
    if (topic) {
      whereClause.topic = topic
    }

    // Fetch vocabulary items
    const vocabularies = await prisma.vocabulary.findMany({
      where: whereClause,
      orderBy: { character: 'asc' },
    })

    // Fetch flashcard review records for the active student
    const reviews = await prisma.flashcardReview.findMany({
      where: { userId: session.userId },
    })

    // Map reviews by vocabularyId for quick lookup
    const reviewMap = new Map(reviews.map(r => [r.vocabularyId, r]))

    // Combine vocab with user reviews
    let result = vocabularies.map(vocab => {
      const review = reviewMap.get(vocab.id)
      return {
        ...vocab,
        status: review ? review.status : 'not_learned',
        nextReview: review ? review.nextReview : null,
        interval: review ? review.interval : 0,
        easeFactor: review ? review.easeFactor : 2.5,
        repetitions: review ? review.repetitions : 0,
      }
    })

    // Filter by dueOnly if requested
    if (dueOnly === 'true') {
      const now = new Date()
      result = result.filter(item => {
        const review = reviewMap.get(item.id)
        if (!review) return true // Never studied, therefore it's due/new
        return new Date(review.nextReview) <= now
      })
    }

    return NextResponse.json({ vocabularies: result })
  } catch (error) {
    console.error('API Vocabulary error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
