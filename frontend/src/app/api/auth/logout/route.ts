import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Create response
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
  
  // Clear the auth token cookie
  response.cookies.set({
    name: 'auth-token',
    value: '',
    expires: new Date(0), // Expire immediately
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  return response;
}

// Also support GET for simple logout via URL
export async function GET(request: NextRequest) {
  // Create redirect response to home page
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Clear the auth token cookie
  response.cookies.set({
    name: 'auth-token',
    value: '',
    expires: new Date(0), // Expire immediately
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  return response;
} 