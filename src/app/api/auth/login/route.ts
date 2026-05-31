export const dynamic = 'force-dynamic'
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { comparePassword, signJWT, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update streak logic
    let updatedStreak = user.streak
    const today = new Date()
    const lastActive = new Date(user.lastActive)

    const diffTime = Math.abs(today.getTime() - lastActive.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Streak continues
      updatedStreak += 1
    } else if (diffDays > 1) {
      // Streak broken
      updatedStreak = 1
    }

    // Update user profile active status
    const updatedUser = await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastActive: today,
        streak: updatedStreak,
      },
    })

    // Sign JWT
    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      placementCompleted: updatedUser.placementCompleted,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        hskLevel: updatedUser.hskLevel,
        learningGoal: updatedUser.learningGoal,
        streak: updatedUser.streak,
        points: updatedUser.points,
      },
    })

    // Set cookie valid for 7 days
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    )
  }
}
