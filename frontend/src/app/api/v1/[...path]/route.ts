// Correctly typed route handler for dynamic API routes in Next.js App Router
import { NextRequest } from 'next/server';

// Fixed API base URL - remove any path component
const API_BASE_URL = process.env.API_URL || 'http://localhost:80';

// Extended RequestInit type that includes the duplex option
interface ExtendedRequestInit extends RequestInit {
  duplex?: 'half';
}

// Extended Request init options for the Request constructor
interface ExtendedRequestOptions extends RequestInit {
  duplex?: 'half';
}

export async function GET(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  // Ensure correct API path prefix (/api/v1/...)
  const url = `${API_BASE_URL}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

  console.log(`[API Proxy] GET ${url}`);

  try {
    const headers = new Headers(request.headers);
    const response = await fetch(url, { headers });
    return response;
  } catch (error) {
    console.error('[API Proxy] GET Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  // Ensure correct API path prefix (/api/v1/...)
  const url = `${API_BASE_URL}/api/v1/${path}`;

  console.log(`[API Proxy] POST to backend URL: ${url}`);

  try {
    // Clone request for debugging
    const requestClone = request.clone();
    const contentType = requestClone.headers.get('content-type') || '';
    
    console.log('[API Proxy] Content-Type:', contentType);
    
    // For multipart/form-data requests (file uploads)
    if (contentType.includes('multipart/form-data')) {
      console.log('[API Proxy] Handling multipart/form-data request');
      
      try {
        // Get the form data
        const formData = await requestClone.formData();
        
        // Log form data entries for debugging
        const formEntries: Record<string, string> = {};
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            formEntries[key] = `File: ${value.name} (${value.size} bytes)`;
          } else {
            formEntries[key] = String(value);
          }
        }
        console.log('[API Proxy] Form data entries:', formEntries);
        
        // Convert formData to regular application/x-www-form-urlencoded format
        // for file upload - this is more reliable than multipart/form-data through proxies
        const requestOptions: ExtendedRequestOptions = {
          method: 'POST',
          body: formData,
          // Don't set headers manually for multipart/form-data
          duplex: 'half', // Required for streaming bodies
        };
        
        const forwardRequest = new Request(url, requestOptions);
        
        console.log(`[API Proxy] Forwarding file upload to: ${url}`);
        const response = await fetch(forwardRequest);
        
        console.log(`[API Proxy] Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[API Proxy] Backend error response:', errorText);
          
          // Forward the error response
          return new Response(errorText, {
            status: response.status,
            headers: {
              'Content-Type': response.headers.get('Content-Type') || 'text/plain'
            }
          });
        }
        
        // Forward the success response
        const responseData = await response.text();
        console.log('[API Proxy] Backend success response:', responseData.substring(0, 100) + '...');
        
        return new Response(responseData, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('Content-Type') || 'application/json'
          }
        });
      } catch (uploadError) {
        console.error('[API Proxy] File upload error:', uploadError);
        return new Response(JSON.stringify({ 
          error: 'Failed to proxy file upload request',
          details: uploadError instanceof Error ? uploadError.message : String(uploadError)
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } 
    // For JSON and other content types
    else {
      // Forward the headers and body directly
      const headers = new Headers();
      for (const [key, value] of requestClone.headers.entries()) {
        // Only copy safe headers
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
          headers.set(key, value);
        }
      }
      
      const fetchOptions: ExtendedRequestInit = {
        method: 'POST',
        headers,
        body: requestClone.body,
        duplex: 'half', // Required when sending a ReadableStream body in Node.js 18+
      };
      
      const response = await fetch(url, fetchOptions);
      return response;
    }
  } catch (error) {
    console.error('[API Proxy] POST Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to proxy request',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  // Ensure correct API path prefix (/api/v1/...)
  const url = `${API_BASE_URL}/api/v1/${path}`;

  console.log(`[API Proxy] PUT ${url}`);

  try {
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    const fetchOptions: ExtendedRequestInit = {
      method: 'PUT',
      headers,
      body: request.body,
      duplex: 'half', // Required when sending a ReadableStream body in Node.js 18+
    };
    
    const response = await fetch(url, fetchOptions);
    
    return response;
  } catch (error) {
    console.error('[API Proxy] PUT Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split('/').slice(3);
  const path = pathSegments.join('/');
  // Ensure correct API path prefix (/api/v1/...)
  const url = `${API_BASE_URL}/api/v1/${path}`;

  console.log(`[API Proxy] DELETE ${url}`);

  try {
    const headers = new Headers(request.headers);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    return response;
  } catch (error) {
    console.error('[API Proxy] DELETE Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 