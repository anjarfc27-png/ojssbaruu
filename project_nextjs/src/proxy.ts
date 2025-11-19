import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/editor',
  '/author',
  '/reviewer',
  '/api/admin',
  '/api/editor',
  '/api/author',
  '/api/reviewer'
]

// Define role-based routes
const roleRoutes = {
  admin: ['/admin', '/dashboard'],
  manager: ['/admin', '/dashboard'],
  editor: ['/editor', '/dashboard'],
  'section-editor': ['/editor', '/dashboard'],
  copyeditor: ['/editor', '/dashboard'],
  proofreader: ['/editor', '/dashboard'],
  'layout-editor': ['/editor', '/dashboard'],
  author: ['/author', '/dashboard'],
  reviewer: ['/reviewer', '/dashboard'],
  reader: ['/dashboard'],
  'subscription-manager': ['/dashboard']
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login and auth API routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get current user
  const user = await getCurrentUser(request)

  if (!user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  const userRoles = user.roles.map(r => r.role_path)
  
  // Special case: dashboard is accessible to all authenticated users
  if (pathname === '/dashboard' && user.roles.length > 0) {
    return NextResponse.next()
  }
  
  // Tentukan daftar role yang diizinkan untuk path ini
  const matchedRoles = Object.entries(roleRoutes)
    .filter(([, routes]) => routes.some(route => pathname.startsWith(route)))
    .map(([role]) => role)

  if (matchedRoles.length > 0) {
    const hasAllowedRole = matchedRoles.some(role => userRoles.includes(role))
    if (!hasAllowedRole) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
