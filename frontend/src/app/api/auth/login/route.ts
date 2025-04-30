import { NextRequest, NextResponse } from 'next/server';

const MOCK_USERS = [
  { 
    id: '1', 
    email: 'user@example.com', 
    password: 'password123' // In a real app, this would be hashed
  }
];

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password } = body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        },
        { status: 400 }
      );
    }
    
    // First check if the user exists with this email
    const userExists = MOCK_USERS.find(u => u.email === email);
    
    if (!userExists) {
      return NextResponse.json(
        { 
          error: 'Account Not Found',
          message: 'No account found with this email address',
          code: 'USER_NOT_FOUND',
          action: {
            type: 'REDIRECT',
            destination: '/signup',
            data: { email } // Pass the email to prefill signup form
          }
        },
        { status: 404 }
      );
    }
    
    // Now check credentials
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Invalid Credentials',
          message: 'The password you entered is incorrect',
          code: 'INVALID_PASSWORD'
        },
        { status: 401 }
      );
    }
    
    // Get the callback URL from the request or default to playground
    const callbackUrl = new URL(request.nextUrl).searchParams.get('callbackUrl') || '/playground';
    
    // Create a secure cookie with the auth token
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email
        },
        redirect: callbackUrl
      },
      { status: 200 }
    );
    
    // Set authentication cookie
    response.cookies.set({
      name: 'auth-token',
      value: `user-${user.id}-${Date.now()}`,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Server Error',
        message: 'An unexpected error occurred. Please try again later.',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

// Handle redirect from middleware
export async function GET(request: NextRequest) {
  const callbackUrl = new URL(request.nextUrl).searchParams.get('callbackUrl') || '/playground';
  const email = new URL(request.nextUrl).searchParams.get('email') || '';
  
  // If we have an email, we can redirect to signup with it prefilled
  if (email) {
    return NextResponse.redirect(
      new URL(`/signup?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
    );
  }
  
  // Otherwise, redirect to login
  return NextResponse.redirect(
    new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
  );
} 