// src/app/api/analytics/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch count of completed lessons
    const completedProgress = await prisma.userProgress.findMany({
      where: {
        userId: session.userId,
        completed: true,
      },
      include: {
        lesson: {
          include: {
            listening: true,
            speaking: true,
            reading: true,
            writing: true,
          },
        },
      },
    })

    // Calculate skills progress (base 0, max 100)
    // We increment based on completed content types, plus submissions
    let listeningScore = 20 // base
    let readingScore = 20 // base
    let speakingScore = 20 // base
    let writingScore = 20 // base

    completedProgress.forEach(prog => {
      if (prog.lesson.listening) listeningScore += 15
      if (prog.lesson.reading) readingScore += 15
      if (prog.lesson.speaking) speakingScore += 10
      if (prog.lesson.writing) writingScore += 10
    })

    // Add extra score for actual recordings/submissions
    const recordingCount = await prisma.speakingRecording.count({
      where: { userId: session.userId },
    })
    speakingScore += recordingCount * 15

    const writingCount = await prisma.writingSubmission.count({
      where: { userId: session.userId },
    })
    writingScore += writingCount * 15

    // Clamp values between 0 and 100
    listeningScore = Math.min(listeningScore, 100)
    readingScore = Math.min(readingScore, 100)
    speakingScore = Math.min(speakingScore, 100)
    writingScore = Math.min(writingScore, 100)

    // 2. Vocabulary learned stats
    const vocabMastered = await prisma.flashcardReview.count({
      where: { userId: session.userId, status: 'mastered' },
    })
    const vocabLearning = await prisma.flashcardReview.count({
      where: { userId: session.userId, status: 'learning' },
    })
    const totalVocabInDb = await prisma.vocabulary.count()

    // 3. Quiz stats
    const quizResults = await prisma.quizResult.findMany({
      where: { userId: session.userId },
    })
    const totalQuizzesTaken = quizResults.length
    const avgScorePercent = totalQuizzesTaken > 0
      ? Math.round((quizResults.reduce((acc, q) => acc + (q.score / q.maxScore), 0) / totalQuizzesTaken) * 100)
      : 0

    // 4. "Gợi ý ôn tập" (Weak Areas Reviews Recommendations)
    // Fetch vocabulary reviews that are due or in "learning" state
    const weakVocabReviews = await prisma.flashcardReview.findMany({
      where: {
        userId: session.userId,
        status: 'learning',
      },
      take: 4,
      include: {
        vocabulary: true,
      },
    })
    const weakVocabs = weakVocabReviews.map(r => r.vocabulary)

    // Fetch grammar points connected to active level
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: { hskLevel: true },
    })
    const level = userProfile?.hskLevel || 1

    const suggestedGrammars = await prisma.grammarPoint.findMany({
      where: {
        lesson: {
          level: level,
        },
      },
      take: 2,
    })

    return NextResponse.json({
      success: true,
      skills: {
        listening: listeningScore,
        speaking: speakingScore,
        reading: readingScore,
        writing: writingScore,
      },
      vocab: {
        mastered: vocabMastered,
        learning: vocabLearning,
        total: totalVocabInDb,
      },
      quiz: {
        taken: totalQuizzesTaken,
        avgScore: avgScorePercent,
      },
      recommendations: {
        vocabs: weakVocabs,
        grammars: suggestedGrammars,
      },
    })
  } catch (error) {
    console.error('API Analytics error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
