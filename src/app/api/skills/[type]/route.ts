export const dynamic = 'force-dynamic'
// src/app/api/skills/[type]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type: skillType } = await params
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let results: any[] = []

    switch (skillType) {
      case 'listening':
        results = await prisma.listeningLesson.findMany({
          orderBy: { createdAt: 'asc' },
          include: { lesson: { select: { title: true, level: true } } },
        })
        break
      case 'speaking':
        results = await prisma.speakingTopic.findMany({
          orderBy: { createdAt: 'asc' },
          include: { lesson: { select: { title: true, level: true } } },
        })
        break
      case 'reading':
        results = await prisma.readingLesson.findMany({
          orderBy: { createdAt: 'asc' },
          include: { lesson: { select: { title: true, level: true } } },
        })
        break
      case 'writing':
        results = await prisma.writingTask.findMany({
          orderBy: { createdAt: 'asc' },
          include: { lesson: { select: { title: true, level: true } } },
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid skill type' }, { status: 400 })
    }

    return NextResponse.json({ skills: results })
  } catch (error) {
    console.error(`API Skills [${params}] error:`, error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
