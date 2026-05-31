// src/app/api/profile/hearts/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: { subscription: true, dailyMissions: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let missionsObj: any = {}
    try {
      missionsObj = JSON.parse(user.dailyMissions || '{}')
    } catch (_) {
      missionsObj = {}
    }

    const todayStr = new Date().toISOString().split('T')[0]
    if (missionsObj.date !== todayStr) {
      missionsObj = {
        date: todayStr,
        words: missionsObj.words || 0,
        quiz: missionsObj.quiz || 0,
        speak: missionsObj.speak || 0,
        lesson: missionsObj.lesson || 0,
        aiChats: missionsObj.aiChats || 0,
        hearts: 5
      }
    }

    if (missionsObj.hearts === undefined) {
      missionsObj.hearts = 5
    }

    return NextResponse.json({
      hearts: user.subscription === 'pro' ? 999 : missionsObj.hearts,
      subscription: user.subscription
    })
  } catch (error) {
    console.error('API GET profile/hearts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await req.json()
    if (!action || !['decrement', 'increment', 'refill'].includes(action)) {
      return NextResponse.json({ error: 'Invalid or missing action' }, { status: 400 })
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let missionsObj: any = {}
    try {
      missionsObj = JSON.parse(user.dailyMissions || '{}')
    } catch (_) {
      missionsObj = {}
    }

    const todayStr = new Date().toISOString().split('T')[0]
    if (missionsObj.date !== todayStr) {
      missionsObj = {
        date: todayStr,
        words: missionsObj.words || 0,
        quiz: missionsObj.quiz || 0,
        speak: missionsObj.speak || 0,
        lesson: missionsObj.lesson || 0,
        aiChats: missionsObj.aiChats || 0,
        hearts: 5
      }
    }

    if (missionsObj.hearts === undefined) {
      missionsObj.hearts = 5
    }

    if (user.subscription !== 'pro') {
      if (action === 'decrement') {
        missionsObj.hearts = Math.max(0, missionsObj.hearts - 1)
      } else if (action === 'increment') {
        missionsObj.hearts = Math.min(5, missionsObj.hearts + 1)
      } else if (action === 'refill') {
        missionsObj.hearts = 5
      }

      await prisma.userProfile.update({
        where: { id: user.id },
        data: {
          dailyMissions: JSON.stringify(missionsObj)
        }
      })
    }

    return NextResponse.json({
      success: true,
      hearts: user.subscription === 'pro' ? 999 : missionsObj.hearts,
      subscription: user.subscription
    })
  } catch (error) {
    console.error('API POST profile/hearts error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
