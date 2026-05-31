// src/app/api/skills/speaking/submit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { speakingTopicId, duration, selfPronScore, selfToneScore, selfFluencyScore, selfVocabScore } = await req.json()

    if (!speakingTopicId) {
      return NextResponse.json({ error: 'speakingTopicId is required' }, { status: 400 })
    }

    // Save SpeakingRecording
    const recording = await prisma.speakingRecording.create({
      data: {
        userId: session.userId,
        speakingTopicId,
        duration: duration || 10,
        audioUrl: `/audio/recordings/speaking_${Date.now()}.mp3`, // simulated audio path
        selfPronScore: selfPronScore || null,
        selfToneScore: selfToneScore || null,
        selfFluencyScore: selfFluencyScore || null,
        selfVocabScore: selfVocabScore || null,
      },
    })

    // Award XP: +15 XP for practicing speaking
    const pointsAwarded = 15
    await prisma.userProfile.update({
      where: { id: session.userId },
      data: {
        points: { increment: pointsAwarded },
      },
    })

    return NextResponse.json({
      success: true,
      recording,
      pointsAwarded,
    })
  } catch (error) {
    console.error('API Save Speaking Recording error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return the list of user recordings for history
    const recordings = await prisma.speakingRecording.findMany({
      where: { userId: session.userId },
      include: {
        speakingTopic: {
          select: {
            title: true,
            prompt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recordings })
  } catch (error) {
    console.error('API Get Speaking Recordings error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
