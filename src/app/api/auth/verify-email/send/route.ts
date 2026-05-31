export const dynamic = 'force-dynamic'
// src/app/api/auth/verify-email/send/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendOTPEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email không hợp lệ. Vui lòng kiểm tra lại.' },
        { status: 400 }
      )
    }

    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Upsert verification record
    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        code,
        expiresAt,
        verified: false,
      },
      create: {
        email,
        code,
        expiresAt,
        verified: false,
      },
    })

    // Gửi mã OTP xác thực thực tế qua Resend
    await sendOTPEmail(email, code)

    // Log the OTP code for local dev testing fallback
    console.log(`[EMAIL OTP VERIFICATION] Code for ${email} is: ${code}`)

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
      // Return code in JSON only for local dev convenience
      debugCode: code,
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Không thể gửi mã xác nhận. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
