// src/app/api/auth/verify-email/confirm/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email và mã xác thực không được để trống.' },
        { status: 400 }
      )
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Không tìm thấy yêu cầu xác minh cho email này.' },
        { status: 404 }
      )
    }

    if (verification.code !== code) {
      return NextResponse.json(
        { error: 'Mã xác thực không chính xác.' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (verification.expiresAt < now) {
      return NextResponse.json(
        { error: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.' },
        { status: 400 }
      )
    }

    // Set verified to true
    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Xác minh email thành công! Bạn có thể tiếp tục tạo tài khoản.',
    })
  } catch (error) {
    console.error('Confirm OTP error:', error)
    return NextResponse.json(
      { error: 'Không thể xác nhận mã xác thực. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
