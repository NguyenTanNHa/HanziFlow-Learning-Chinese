export const dynamic = 'force-dynamic'
// src/app/api/leaderboard/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch top 10 users by points
    const topUsers = await prisma.userProfile.findMany({
      take: 10,
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        points: true,
        streak: true,
        hskLevel: true,
        subscription: true,
      },
    })

    // Find current user's rank
    const allUsers = await prisma.userProfile.findMany({
      orderBy: { points: 'desc' },
      select: { id: true },
    })

    const currentUserRank = allUsers.findIndex(u => u.id === session.userId) + 1

    return NextResponse.json({
      success: true,
      leaderboard: topUsers,
      currentUserRank,
    })
  } catch (error) {
    console.error('API Leaderboard error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
