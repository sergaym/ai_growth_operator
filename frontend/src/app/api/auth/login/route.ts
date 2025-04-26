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
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the user (simplified - this would be a database query in a real app)
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Get the callback URL from the request or default to playground
    const callbackUrl = new URL(request.nextUrl).searchParams.get('callbackUrl') || '/playground';
    
    // Create a secure cookie with the auth token
    // In a real app, this would generate a JWT or other authentication token
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );
    
    // Set authentication cookie
    // Expire in 7 days, httpOnly for security, Secure in production
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle redirect from middleware
export async function GET(request: NextRequest) {
  // Get the callback URL from the request or default to playground
  const callbackUrl = new URL(request.nextUrl).searchParams.get('callbackUrl') || '/playground';
  
  // Redirect to the login page with the callback URL
  return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url));
} 