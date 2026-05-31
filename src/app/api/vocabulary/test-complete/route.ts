export const dynamic = 'force-dynamic'
// src/app/api/vocabulary/test-complete/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { points } = await req.json()

    if (points === undefined || typeof points !== 'number' || points < 0) {
      return NextResponse.json({ error: 'Invalid points value' }, { status: 400 })
    }

    // Update user profile points
    const updatedUser = await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: points },
      },
      select: {
        points: true,
      },
    })

    return NextResponse.json({
      success: true,
      points: updatedUser.points,
      pointsAwarded: points,
    })
  } catch (error) {
    console.error('API Vocabulary Test Complete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
