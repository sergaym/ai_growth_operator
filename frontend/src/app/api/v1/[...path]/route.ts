/**
 * API route that proxies requests to our backend
 * This allows frontend to make requests without dealing with CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

// API URL from env with fallback
const API_URL = process.env.API_URL || 'http://localhost:80/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  // Forward headers for auth
  const headers = new Headers(request.headers);
  
  try {
    const response = await fetch(url, {
      headers,
      cache: 'no-store',
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying GET request to ${url}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request to API server' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${API_URL}/${path}`;
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward headers for auth
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying POST request to ${url}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request to API server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${API_URL}/${path}`;
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward headers for auth
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying PUT request to ${url}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request to API server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${API_URL}/${path}`;
  
  try {
    // Forward headers for auth
    const headers = new Headers(request.headers);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying DELETE request to ${url}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request to API server' },
      { status: 500 }
    );
  }
} 