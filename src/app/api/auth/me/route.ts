export const dynamic = 'force-dynamic'
// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyJWT, COOKIE_NAME } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    // Read session cookie
    const cookies = req.headers.get('cookie') || ''
    const match = cookies.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'))
    const token = match ? match[2] : null

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Fetch latest user data from DB
    const user = await prisma.userProfile.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        hskLevel: true,
        learningGoal: true,
        streak: true,
        points: true,
        role: true,
        dob: true,
        bio: true,
        phone: true,
        gender: true,
        nativeLanguage: true,
        learningTimeGoal: true,
        subscription: true,
        dailyMissions: true,
        streakFreezes: true,
        lastActive: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // --- Streak & Streak Freeze Processing ---
    const lastActiveDate = new Date(user.lastActive)
    const today = new Date()

    const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate())
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const diffTime = todayDay.getTime() - lastActiveDay.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let updatedStreak = user.streak
    let updatedFreezes = user.streakFreezes
    let newLastActive = lastActiveDate
    let shouldUpdateDB = false

    if (diffDays === 1) {
      // Streak continues today!
      updatedStreak = user.streak + 1
      newLastActive = today
      shouldUpdateDB = true
    } else if (diffDays > 1) {
      // Missed at least one day
      if (diffDays === 2 && user.streakFreezes > 0) {
        // Missed exactly 1 day and has freeze: consume 1 freeze and set lastActive to yesterday
        updatedFreezes = user.streakFreezes - 1
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        newLastActive = yesterday
        shouldUpdateDB = true
      } else {
        // Missed more than 1 day or has no freeze: reset streak to 1 (since active today)
        updatedStreak = 1
        newLastActive = today
        shouldUpdateDB = true
      }
    }

    if (shouldUpdateDB) {
      await prisma.userProfile.update({
        where: { id: user.id },
        data: {
          streak: updatedStreak,
          streakFreezes: updatedFreezes,
          lastActive: newLastActive,
        },
      })
      // Sync local object for response
      user.streak = updatedStreak
      user.streakFreezes = updatedFreezes
    }
    // ------------------------------------------

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
