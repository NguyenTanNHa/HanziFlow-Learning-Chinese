// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// Lazily get the JWT key — only evaluated at request time, not during build
function getKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Set it in your environment variables.')
  }
  return new TextEncoder().encode(secret)
}

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
    .sign(getKey())
}

// Verify JWT token
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey(), {
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
