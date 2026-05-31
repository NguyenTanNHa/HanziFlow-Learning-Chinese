// scratch/test-db.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const prisma = new PrismaClient()
const JWT_SECRET = 'hanziflow-default-jwt-secret-key-12345678'
const KEY = new TextEncoder().encode(JWT_SECRET)

async function test() {
  try {
    const email = 'student@hanziflow.com'
    const password = 'password123'

    const user = await prisma.userProfile.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('User not found!')
      return
    }

    console.log('User found:', user.email)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isPasswordValid)

    // Update streak logic
    let updatedStreak = user.streak
    const today = new Date()
    const lastActive = new Date(user.lastActive)

    const diffTime = Math.abs(today.getTime() - lastActive.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    console.log('diffTime:', diffTime, 'diffDays:', diffDays)

    if (diffDays === 1) {
      updatedStreak += 1
    } else if (diffDays > 1) {
      updatedStreak = 1
    }

    console.log('Attempting DB update...')
    const updatedUser = await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastActive: today,
        streak: updatedStreak,
      },
    })
    console.log('DB update success! New streak:', updatedUser.streak)

    console.log('Signing JWT...')
    const token = await new SignJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      placementCompleted: updatedUser.placementCompleted,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(KEY)
    
    console.log('JWT Sign success! Token length:', token.length)
  } catch (err) {
    console.error('Error during simulated login sequence:', err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
