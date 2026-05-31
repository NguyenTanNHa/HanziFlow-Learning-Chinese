// src/app/api/grammar/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const grammarPoints = await prisma.grammarPoint.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ grammarPoints })
  } catch (error) {
    console.error('API Grammar error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
