// src/app/api/admin/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

// Security check helper
async function checkAdmin(req: NextRequest) {
  const session = await getUserFromSession(req)
  if (!session || session.role !== 'admin') {
    return false
  }
  return true
}

export async function GET(req: NextRequest) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessons = await prisma.lesson.findMany({
      orderBy: { level: 'asc' },
      include: { stage: { select: { title: true } } },
    })

    const vocabularies = await prisma.vocabulary.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const grammars = await prisma.grammarPoint.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Fetch roadmap stages to populate selectors in creation forms
    const stages = await prisma.roadmapStage.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      lessons,
      vocabularies,
      grammars,
      stages,
    })
  } catch (error) {
    console.error('API Admin GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type } = body

    if (type === 'vocabulary') {
      const { character, pinyin, meaningVi, meaningEn, exampleZh, exampleVi, hskLevel, topic, lessonId } = body
      if (!character || !pinyin || !meaningVi || !exampleZh || !exampleVi) {
        return NextResponse.json({ error: 'Missing required vocabulary fields' }, { status: 400 })
      }
      
      const newVocab = await prisma.vocabulary.create({
        data: {
          character,
          pinyin,
          meaningVi,
          meaningEn,
          exampleZh,
          exampleVi,
          hskLevel: Number(hskLevel) || 1,
          topic: topic || 'study',
          lessonId: lessonId || null,
        },
      })
      return NextResponse.json({ success: true, item: newVocab })
    }

    if (type === 'grammar') {
      const { title, formula, explanationVi, example1Zh, example1Vi, example2Zh, example2Vi, example3Zh, example3Vi, lessonId, quizQuestion, quizOptions, quizAnswer } = body
      if (!title || !formula || !explanationVi || !example1Zh || !example1Vi) {
        return NextResponse.json({ error: 'Missing required grammar fields' }, { status: 400 })
      }

      const newGrammar = await prisma.grammarPoint.create({
        data: {
          title,
          formula,
          explanationVi,
          example1Zh,
          example1Vi,
          example2Zh,
          example2Vi,
          example3Zh,
          example3Vi,
          lessonId: lessonId || null,
          quizQuestion,
          quizOptions: quizOptions ? JSON.stringify(quizOptions.split(',').map((s: string) => s.trim())) : null,
          quizAnswer,
        },
      })
      return NextResponse.json({ success: true, item: newGrammar })
    }

    if (type === 'lesson') {
      const { title, description, level, order, stageId } = body
      if (!title || !stageId || !level || !order) {
        return NextResponse.json({ error: 'Missing required lesson fields' }, { status: 400 })
      }

      const newLesson = await prisma.lesson.create({
        data: {
          title,
          description,
          level: Number(level) || 1,
          order: Number(order) || 1,
          stageId,
        },
      })
      return NextResponse.json({ success: true, item: newLesson })
    }

    return NextResponse.json({ error: 'Invalid entity creation type' }, { status: 400 })
  } catch (error) {
    console.error('API Admin POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
