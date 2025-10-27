import { NextRequest, NextResponse } from 'next/server';

import { API_BASE_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { address_id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const addressId = params.address_id;
    console.log(`🌐 GET /users/me/addresses/${addressId} - Connecting to real backend API...`);

    const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to get address', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ GET /users/me/addresses/${addressId} - External API response received`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error getting address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { address_id: string } }
) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const addressId = params.address_id;
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log(`🌐 PUT /users/me/addresses/${addressId} - Connecting to real backend API...`);

    const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to update address', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ PUT /users/me/addresses/${addressId} - External API response received`);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { address_id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const addressId = params.address_id;
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log(`🌐 DELETE /users/me/addresses/${addressId} - Connecting to real backend API...`);

    const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to delete address', details: errorData },
        { status: response.status }
      );
    }

    console.log(`✅ DELETE /users/me/addresses/${addressId} - External API response received`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
