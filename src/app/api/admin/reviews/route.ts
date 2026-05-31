// src/app/api/admin/reviews/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    // Fetch speaking recordings requiring review
    const speakingRecordings = await prisma.speakingRecording.findMany({
      include: {
        userProfile: {
          select: {
            name: true,
            email: true,
          },
        },
        speakingTopic: {
          select: {
            title: true,
            prompt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch writing submissions requiring review
    const writingSubmissions = await prisma.writingSubmission.findMany({
      include: {
        userProfile: {
          select: {
            name: true,
            email: true,
          },
        },
        writingTask: {
          select: {
            title: true,
            prompt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      speakingRecordings,
      writingSubmissions,
    })
  } catch (error) {
    console.error('API Admin Reviews GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 })
    }

    const { type, id, score, feedback } = await req.json()

    if (!type || !id || score === undefined || score === null) {
      return NextResponse.json({ error: 'Type, id, and score are required' }, { status: 400 })
    }

    const numericScore = Number(score)
    if (numericScore < 0 || numericScore > 10) {
      return NextResponse.json({ error: 'Score must be between 0 and 10' }, { status: 400 })
    }

    let updatedRecord = null

    if (type === 'speaking') {
      updatedRecord = await prisma.speakingRecording.update({
        where: { id },
        data: {
          teacherScore: numericScore,
          teacherFeedback: feedback || '',
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
      })
    } else if (type === 'writing') {
      updatedRecord = await prisma.writingSubmission.update({
        where: { id },
        data: {
          teacherScore: numericScore,
          teacherFeedback: feedback || '',
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid submission type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      updatedRecord,
    })
  } catch (error) {
    console.error('API Admin Reviews POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
