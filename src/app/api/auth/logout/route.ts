export const dynamic = 'force-dynamic'
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the auth cookie by setting its maxAge to 0
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  
  return response
}
