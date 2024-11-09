// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 현재 경로
  const path = request.nextUrl.pathname

  // 로그인이 필요한 보호된 경로들
  const protectedPaths = []; //보호를 해제하려면 비워둠

  // 항상 접근 가능한 public 경로들
  const publicPaths = [
    '/',  // 메인 페이지
    '/components/Auth/login',
    '/components/Auth/signup',
    '/components/Auth/reset-password'
  ]

  // public 경로는 항상 접근 허용
  if (publicPaths.some(publicPath => path === publicPath)) {
    return NextResponse.next()
  }

  // 보호된 경로 체크
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isProtectedPath) {
    const token = request.cookies.get('token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 그 외의 경로는 모두 허용
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}