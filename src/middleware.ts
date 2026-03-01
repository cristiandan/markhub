/**
 * Next.js Middleware for authentication.
 * Protects routes that require authentication.
 *
 * Note: NextAuth.js v5's auth() middleware requires Node.js runtime
 * due to crypto dependencies from JWT/Prisma operations.
 *
 * @see https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Force Node.js runtime (Edge runtime doesn't support crypto module)
export const runtime = 'nodejs';

/**
 * Routes that require authentication.
 * Users accessing these routes without a valid session
 * will be redirected to the sign-in page.
 */
const protectedPaths = [
  '/dashboard',
  '/settings',
  '/new', // Create new file
];

/**
 * Check if a path is protected.
 */
function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Authentication middleware.
 * Checks session for protected routes and redirects if unauthorized.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if this is a protected route
  if (isProtectedPath(pathname)) {
    // req.auth is populated by the auth() middleware wrapper
    if (!req.auth) {
      // Build sign-in URL with callback to return user to requested page
      const signInUrl = new URL('/api/auth/signin', req.nextUrl.origin);
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);

      return NextResponse.redirect(signInUrl);
    }
  }

  // Allow request to proceed
  return NextResponse.next();
});

/**
 * Middleware configuration.
 * Defines which routes the middleware runs on.
 *
 * Excludes:
 * - API routes (handled separately)
 * - Static files
 * - Images
 * - Auth routes (to prevent redirect loops)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
