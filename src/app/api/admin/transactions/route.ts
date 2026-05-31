// src/app/api/admin/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'

async function checkAdmin(req: NextRequest) {
  const session = await getUserFromSession(req)
  if (!session || session.role !== 'admin') {
    return false
  }
  return true
}

// GET: Fetch all transactions for admin panel
export async function GET(req: NextRequest) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, transactions })
  } catch (error) {
    console.error('API Admin Get Transactions error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST: Approve or Reject a transaction
export async function POST(req: NextRequest) {
  try {
    if (!await checkAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { transactionId, action } = body

    if (!transactionId || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 })
    }

    if (action === 'APPROVE') {
      // 1. Update transaction status
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: 'APPROVED' },
      })

      // 2. Update user subscription
      await prisma.userProfile.update({
        where: { id: transaction.userId },
        data: { subscription: 'pro' },
      })
    } else {
      // Reject transaction
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: 'REJECTED' },
      })
    }

    return NextResponse.json({ success: true, message: `Transaction has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.` })
  } catch (error) {
    console.error('API Admin Process Transaction error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
