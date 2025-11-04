import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedApiPaths = [
  '/api/workouts',
  '/api/nutrition',
  '/api/recovery',
  '/api/strength-index',
  '/api/achievements',
  '/api/workout-prs',
  '/api/user',
  '/api/export',
  '/api/ai',
  '/api/ai-coach',
  '/api/recommendations',
  '/api/growth-prediction',
  '/api/social',
  '/api/onboarding',
  '/api/templates',
  '/api/exercises',
  '/api/exercise-templates',
];

// Public paths that don't need auth
const publicPaths = [
  '/api/auth',
  '/api/test-models',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = protectedApiPaths.some(path => pathname.startsWith(path));

  if (requiresAuth) {
    // Get JWT token from request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no valid token, return 401
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Verify userId matches token
    const userId = request.nextUrl.searchParams.get('userId') || 
                   (request.method !== 'GET' ? await request.clone().json().then(body => body.userId).catch(() => null) : null);

    if (userId && userId !== token.sub) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden - Cannot access other users data' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
