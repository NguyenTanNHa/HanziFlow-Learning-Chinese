export const dynamic = 'force-dynamic'
// src/app/api/profile/update/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'
import { z } from 'zod'

// Định nghĩa Schema validate bằng Zod
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống.').max(50, 'Tên tối đa 50 ký tự.').optional().nullable(),
  hskLevel: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().min(1).max(6)).optional(),
  learningGoal: z.string().max(100, 'Mục tiêu học tối đa 100 ký tự.').optional(),
  avatarUrl: z.string().url('Đường dẫn ảnh đại diện không hợp lệ.').or(z.string().length(0)).optional().nullable(),
  dob: z.string().refine(val => !val || !isNaN(Date.parse(val)), 'Ngày sinh không hợp lệ.').optional().nullable(),
  bio: z.string().max(300, 'Giới thiệu bản thân tối đa 300 ký tự.').optional().nullable(),
  phone: z.string().regex(/^[0-9+()#*\s-]{9,15}$/, 'Số điện thoại không hợp lệ.').or(z.string().length(0)).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  nativeLanguage: z.string().max(50).optional().nullable(),
  learningTimeGoal: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().min(5).max(300)).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    const parseResult = updateProfileSchema.safeParse(body)
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Dữ liệu đầu vào không hợp lệ.'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const validated = parseResult.data

    // Xây dựng đối tượng cập nhật dựa trên dữ liệu đã xác thực
    const updateData: any = {}
    if (validated.name !== undefined) updateData.name = validated.name
    if (validated.hskLevel !== undefined) updateData.hskLevel = validated.hskLevel
    if (validated.learningGoal !== undefined) updateData.learningGoal = validated.learningGoal
    if (validated.avatarUrl !== undefined) updateData.avatarUrl = validated.avatarUrl
    if (validated.dob !== undefined) updateData.dob = validated.dob ? new Date(validated.dob) : null
    if (validated.bio !== undefined) updateData.bio = validated.bio
    if (validated.phone !== undefined) updateData.phone = validated.phone
    if (validated.gender !== undefined) updateData.gender = validated.gender
    if (validated.nativeLanguage !== undefined) updateData.nativeLanguage = validated.nativeLanguage
    if (validated.learningTimeGoal !== undefined) updateData.learningTimeGoal = validated.learningTimeGoal

    // Cập nhật thông tin học viên trong cơ sở dữ liệu
    const updatedUser = await prisma.userProfile.update({
      where: { id: session.userId },
      data: updateData,
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
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('API Profile Update error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
