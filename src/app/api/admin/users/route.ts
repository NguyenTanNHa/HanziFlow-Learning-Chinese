export const dynamic = 'force-dynamic'
// src/app/api/admin/users/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

async function checkAdmin(req: NextRequest) {
  const session = await getUserFromSession(req)
  if (!session || session.role !== 'admin') return null
  return session
}

// GET: Lấy danh sách tất cả học viên (không kể admin)
export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.userProfile.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        hskLevel: true,
        subscription: true,
        streak: true,
        points: true,
        placementCompleted: true,
        learningGoal: true,
        phone: true,
        gender: true,
        dob: true,
        bio: true,
        createdAt: true,
        lastActive: true,
        _count: {
          select: {
            progress: true,
            quizResults: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin GET users error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH: Chỉnh sửa thông tin học viên
export async function PATCH(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, name, email, hskLevel, subscription, points, streak, bio, phone, gender } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Ensure target user is not admin
    const target = await prisma.userProfile.findUnique({ where: { id: userId } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (target.role === 'admin') {
      return NextResponse.json({ error: 'Cannot modify admin accounts' }, { status: 403 })
    }

    const updated = await prisma.userProfile.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(hskLevel !== undefined && { hskLevel: Number(hskLevel) }),
        ...(subscription !== undefined && { subscription }),
        ...(points !== undefined && { points: Number(points) }),
        ...(streak !== undefined && { streak: Number(streak) }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        hskLevel: true,
        subscription: true,
        streak: true,
        points: true,
        bio: true,
        phone: true,
        gender: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error: any) {
    console.error('Admin PATCH user error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email đã tồn tại trong hệ thống.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE: Xoá tài khoản học viên
export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const target = await prisma.userProfile.findUnique({ where: { id: userId } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (target.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 403 })
    }

    await prisma.userProfile.delete({ where: { id: userId } })

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản học viên thành công.' })
  } catch (error) {
    console.error('Admin DELETE user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
