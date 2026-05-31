export const dynamic = 'force-dynamic'
// src/app/api/admin/import-vocab/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { vocabularies } = await req.json()

    if (!vocabularies || !Array.isArray(vocabularies) || vocabularies.length === 0) {
      return NextResponse.json({ error: 'An array of vocabularies is required' }, { status: 400 })
    }

    // Insert vocabs in batch
    const createdCount = await prisma.$transaction(
      vocabularies.map(item =>
        prisma.vocabulary.create({
          data: {
            character: item.character,
            pinyin: item.pinyin,
            meaningVi: item.meaningVi,
            meaningEn: item.meaningEn || null,
            exampleZh: item.exampleZh || '',
            exampleVi: item.exampleVi || '',
            hskLevel: Number(item.hskLevel) || 1,
            topic: item.topic || 'study',
            lessonId: item.lessonId || null,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: createdCount.length,
    })
  } catch (error) {
    console.error('API Import Vocab error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
