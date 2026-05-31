// src/app/api/vocabulary/srs-add/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { character, pinyin, meaningVi } = await req.json()

    if (!character) {
      return NextResponse.json({ error: 'Character is required' }, { status: 400 })
    }

    // 1. Check if vocabulary item already exists in the database
    let vocab = await prisma.vocabulary.findFirst({
      where: { character }
    })

    // 2. If not, create a new vocabulary item
    if (!vocab) {
      vocab = await prisma.vocabulary.create({
        data: {
          character,
          pinyin: pinyin || '',
          meaningVi: meaningVi || '',
          exampleZh: `${character}在阅读课文中出现。`,
          exampleVi: `Từ ${character} xuất hiện trong bài đọc.`,
          topic: 'reading',
          hskLevel: 1, // default fallback
        }
      })
    }

    const vocabularyId = vocab.id

    // 3. Check if flashcard review already exists for this user/vocab
    const existingReview = await prisma.flashcardReview.findUnique({
      where: {
        userId_vocabularyId: {
          userId: session.userId,
          vocabularyId,
        }
      }
    })

    if (existingReview) {
      // If it exists, reset status to learning and review date to today
      const review = await prisma.flashcardReview.update({
        where: { id: existingReview.id },
        data: {
          status: 'learning',
          nextReview: new Date(),
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Từ vựng đã có trong danh sách và được cập nhật trạng thái ôn tập!',
        review,
      })
    }

    // 4. Create new Spaced Repetition card (FlashcardReview)
    const review = await prisma.flashcardReview.create({
      data: {
        userId: session.userId,
        vocabularyId,
        status: 'learning',
        nextReview: new Date(),
      }
    })

    // Award XP: +5 XP for adding vocabulary
    await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: 5 }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Lưu thẻ SRS thành công!',
      review,
      pointsAwarded: 5,
    })

  } catch (error) {
    console.error('API SRS Add Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
