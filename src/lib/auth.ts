// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET variable is not configured! Please set it in your environment/hosting dashboard.')
}
const KEY = new TextEncoder().encode(JWT_SECRET)
export const COOKIE_NAME = 'hanziflow-session'

// Hash password using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Compare password using bcryptjs
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Sign JWT token
export async function signJWT(payload: { userId: string; email: string; role: string; [key: string]: any }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(KEY)
}

// Verify JWT token
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, KEY, {
      algorithms: ['HS256'],
    })
    return payload as { userId: string; email: string; role: string; subscription?: string }
  } catch (error) {
    return null
  }
}

// Get user from request session cookies
export async function getUserFromSession(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)
  if (!cookie) return null
  
  const payload = await verifyJWT(cookie.value)
  return payload
}
