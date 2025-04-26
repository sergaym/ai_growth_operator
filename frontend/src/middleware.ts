import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/playground',
  '/playground/(.*)' // Protect all routes under playground
];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Check if the route should be protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => {
    const regex = new RegExp(`^${route}$`);
    return regex.test(pathname);
  });
  
  // If this is a protected route, check for authentication
  if (isProtectedRoute) {
    // Get authentication token from cookie
    const authToken = request.cookies.get('auth-token')?.value;
    const isAuthenticated = !!authToken;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = new URL('/api/auth/login', request.url);
      // Add the original URL as a callback parameter
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Continue with the request if authenticated or not a protected route
  return NextResponse.next();
}

// Configure middleware to run on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 