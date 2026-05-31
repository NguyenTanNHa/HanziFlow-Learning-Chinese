export const dynamic = 'force-dynamic'
// src/app/api/profile/streak-freeze/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

const STREAK_FREEZE_PRICE = 150 // Giá mua: 150 XP

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lấy thông tin hiện tại của học viên
    const user = await prisma.userProfile.findUnique({
      where: { id: session.userId },
      select: {
        points: true,
        streakFreezes: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Kiểm tra số điểm tích lũy của học viên
    if (user.points < STREAK_FREEZE_PRICE) {
      return NextResponse.json({ error: `Bạn cần tối thiểu ${STREAK_FREEZE_PRICE} XP để mua Thẻ đóng băng Streak. (Hiện có: ${user.points} XP)` }, { status: 400 })
    }

    // Thực hiện trừ điểm và cộng thẻ đóng băng
    const updated = await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { decrement: STREAK_FREEZE_PRICE },
        streakFreezes: { increment: 1 },
      },
      select: {
        points: true,
        streakFreezes: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Mua thẻ đóng băng Streak thành công!',
      points: updated.points,
      streakFreezes: updated.streakFreezes,
    })
  } catch (error) {
    console.error('API Buy Streak Freeze error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
