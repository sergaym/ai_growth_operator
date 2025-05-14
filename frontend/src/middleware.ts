import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/playground',
  '/playground/(.*)',
  '/api/v1',
];

// Define public routes that don't need redirection
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/reset-password',
  '/api/auth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for auth token in cookies for protected routes
  const authToken = request.cookies.get('auth-token')?.value;
  
  if (isProtectedRoute && !authToken) {
    // Redirect to login with callback URL
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // For API routes, handle authentication via header
  if (pathname.startsWith('/api/') && isProtectedRoute) {
    // Forward the auth token to the backend
    const requestHeaders = new Headers(request.headers);
    if (authToken) {
      requestHeaders.set('Authorization', `Bearer ${authToken}`);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for static files, favicons, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg)).*)',
  ],
}; 