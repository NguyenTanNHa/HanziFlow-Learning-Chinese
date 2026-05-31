// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'hanziflow-session'
const JWT_SECRET = process.env.JWT_SECRET || 'hanziflow-default-jwt-secret-key-12345678'
const KEY = new TextEncoder().encode(JWT_SECRET)

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/roadmap',
  '/lessons',
  '/vocabulary',
  '/grammar',
  '/listening',
  '/speaking',
  '/reading',
  '/writing',
  '/quiz',
  '/profile',
  '/admin',
  '/leaderboard',
  '/analytics',
]

// List of routes only for unauthenticated users
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const cookie = req.cookies.get(COOKIE_NAME)
  const token = cookie?.value

  // Check if token is valid
  let isAuthenticated = false
  let userRole = 'user'
  let placementCompleted = true

  if (token) {
    try {
      const { payload } = await jwtVerify(token, KEY, {
        algorithms: ['HS256'],
      })
      if (payload && payload.userId) {
        isAuthenticated = true
        userRole = (payload.role as string) || 'user'
        placementCompleted = (payload.placementCompleted as boolean) ?? true
      }
    } catch (err) {
      // Token is invalid/expired
      isAuthenticated = false
    }
  }

  // 1. Redirect authenticated users away from login/register to dashboard
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // 2. Redirect unauthenticated users to login
  if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname === '/placement-test') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url)
      // Save redirect path
      loginUrl.searchParams.set('redirect', pathname)
      
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid cookie if any
      if (token) {
        response.cookies.delete(COOKIE_NAME)
      }
      return response
    }

    // Redirect to placement test if not completed (admin bypasses this)
    if (!placementCompleted && pathname !== '/placement-test' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/placement-test', req.url))
    }

    // Redirect away from placement test if already completed
    if (placementCompleted && pathname === '/placement-test') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // 3. Admin-only route guard
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/roadmap/:path*',
    '/lessons/:path*',
    '/vocabulary/:path*',
    '/grammar/:path*',
    '/listening/:path*',
    '/speaking/:path*',
    '/reading/:path*',
    '/writing/:path*',
    '/quiz/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/leaderboard/:path*',
    '/analytics/:path*',
    '/login',
    '/register',
    '/placement-test',
  ],
}
