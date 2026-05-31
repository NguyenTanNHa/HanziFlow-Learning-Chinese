// src/app/api/admin/link-lesson/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { lessonId, vocabularyIds, grammarIds } = await req.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    // Use transaction to run updates safely
    await prisma.$transaction([
      // Unlink all vocabs currently linked to this lesson
      prisma.vocabulary.updateMany({
        where: { lessonId },
        data: { lessonId: null },
      }),
      // Link new vocabs
      ...(vocabularyIds && Array.isArray(vocabularyIds) && vocabularyIds.length > 0
        ? [
            prisma.vocabulary.updateMany({
              where: { id: { in: vocabularyIds } },
              data: { lessonId },
            }),
          ]
        : []),

      // Unlink all grammars currently linked to this lesson
      prisma.grammarPoint.updateMany({
        where: { lessonId },
        data: { lessonId: null },
      }),
      // Link new grammars
      ...(grammarIds && Array.isArray(grammarIds) && grammarIds.length > 0
        ? [
            prisma.grammarPoint.updateMany({
              where: { id: { in: grammarIds } },
              data: { lessonId },
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      success: true,
      message: 'Linked resources successfully',
    })
  } catch (error) {
    console.error('API Link Lesson error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
