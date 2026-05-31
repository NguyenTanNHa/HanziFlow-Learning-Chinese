export const dynamic = 'force-dynamic'
// src/app/api/profile/upgrade/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

// GET: Check if the user has an active pending transaction
export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pendingTx = await prisma.paymentTransaction.findFirst({
      where: {
        userId: session.userId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      pending: !!pendingTx,
      transaction: pendingTx,
    })
  } catch (error) {
    console.error('API Get Upgrade Status error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Create a pending payment transaction (no longer instantly upgrades)
export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Email prefix code matching the frontend logic
    const emailPrefix = session.email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    const code = `NANGCAP ${emailPrefix}`

    // Check if there is already a PENDING transaction with this code
    let transaction = await prisma.paymentTransaction.findFirst({
      where: {
        userId: session.userId,
        code,
        status: 'PENDING',
      },
    })

    if (!transaction) {
      transaction = await prisma.paymentTransaction.create({
        data: {
          userId: session.userId,
          amount: 230000,
          code,
          status: 'PENDING',
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu nâng cấp đã được tạo. Vui lòng hoàn tất chuyển khoản.',
      status: 'PENDING',
      transaction,
    })
  } catch (error) {
    console.error('API Upgrade Subscription error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Downgrade user back to Free package
export async function DELETE(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Downgrade to free subscription
    const updatedUser = await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        subscription: 'free',
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Downgrade to Free successful!',
      subscription: 'free',
    })

    // Sync session cookie
    const { signJWT, COOKIE_NAME } = await import('@/lib/auth')
    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || '',
      role: updatedUser.role,
      placementCompleted: updatedUser.placementCompleted,
      subscription: 'free',
    })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return response
  } catch (error) {
    console.error('API Downgrade Subscription error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
