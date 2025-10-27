import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = new URLSearchParams();
    
    // Add all query parameters
    for (const [key, value] of searchParams.entries()) {
      params.append(key, value);
    }
    
    // Get authentication headers from the request
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/?${params.toString()}`, {
        method: 'GET',
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (apiError) {
      console.error('External API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch products from backend API',
          details: apiError instanceof Error ? apiError.message : 'Unknown error occurred'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
