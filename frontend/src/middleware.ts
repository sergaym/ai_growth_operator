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
  '/signup',
  '/reset-password',
  '/api/auth',
];

// Define auth endpoints that should always be allowed for token refresh
const AUTH_ENDPOINTS = [
  '/auth/refresh',
  '/auth/signin',
  '/auth/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is an authentication endpoint that should always be allowed
  const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => 
    pathname.includes(endpoint)
  );
  
  // Always allow auth-specific endpoints (like token refresh)
  if (isAuthEndpoint) {
    return NextResponse.next();
  }
  
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
  
  // Check for auth token from multiple sources
  // 1. First check cookies (for server-side auth)
  let authToken = request.cookies.get('auth-token')?.value;
  
  // 2. If no cookie, check Authorization header (for client-side auth)
  if (!authToken) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }
  }
  
  if (isProtectedRoute && !authToken) {
    // For API requests, return 401 instead of redirecting
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For UI routes, redirect to login with callback URL
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // For API routes, handle authentication via header
  if (pathname.startsWith('/api/') && isProtectedRoute && authToken) {
    // Forward the auth token to the backend
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
    
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