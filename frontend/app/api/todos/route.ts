import { NextRequest, NextResponse } from 'next/server';

// Route API Next.js qui fait le proxy vers Django
export async function GET(request: NextRequest) {
  try {
    // Construire l'URL vers Django
    const djangoUrl = 'http://backend:8000/api/todos/';
    
    console.log('🚀 [API] Proxying request to:', djangoUrl);
    console.log('📍 [API] Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Faire la requête vers Django
    const response = await fetch(djangoUrl);
    
    console.log('📡 [API] Django response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ [API] Django API error:', response.status, response.statusText);
      throw new Error(`Django API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [API] Django response data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 [API] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Django API' },
      { status: 500 }
    );
  }
}
