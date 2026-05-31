// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword, signJWT, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password, name, hskLevel, learningGoal } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Verify OTP first
    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    })

    if (!verification || !verification.verified) {
      return NextResponse.json(
        { error: 'Email này chưa được xác minh bằng mã OTP.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Tài khoản với email này đã tồn tại.' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const newUser = await prisma.userProfile.create({
      data: {
        email,
        passwordHash,
        name,
        hskLevel: Number(hskLevel) || 1,
        learningGoal: learningGoal || 'HSK',
        streak: 1, // Start with streak of 1 on sign up
        points: 10, // Starting bonus points
      },
    })

    // Clean up verification record
    await prisma.emailVerification.delete({ where: { email } }).catch(() => {})

    // Sign JWT and set cookie
    const token = await signJWT({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      placementCompleted: false,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        hskLevel: newUser.hskLevel,
        learningGoal: newUser.learningGoal,
      },
    })

    // Set cookie valid for 7 days
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong during registration' },
      { status: 500 }
    )
  }
}
