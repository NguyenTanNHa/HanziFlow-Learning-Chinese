export const dynamic = 'force-dynamic'
// src/app/api/lessons/[id]/complete/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Upsert completion progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId,
        },
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
      create: {
        userId: session.userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    })

    // Award completion XP points (e.g., +50 XP)
    const userProfile = await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: 50 },
      },
    })

    return NextResponse.json({
      success: true,
      progress,
      points: userProfile.points,
      streak: userProfile.streak,
    })
  } catch (error) {
    console.error('API Complete Lesson error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
