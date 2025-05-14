// Correctly typed route handler for dynamic API routes in Next.js App Router
import { NextRequest } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:80/api/v1';

export async function GET(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers = new Headers(request.headers);
    const response = await fetch(url, { headers });
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  const url = `${API_URL}/${path}`;

  try {
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: request.body,
    });
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  const url = `${API_URL}/${path}`;

  try {
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: request.body,
    });
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  const url = `${API_URL}/${path}`;

  try {
    const headers = new Headers(request.headers);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 