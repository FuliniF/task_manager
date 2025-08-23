import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 });
    }

    // Get the access_token cookie from the request
    const accessToken = request.cookies.get('access_token')?.value;
    
    // Add debugging
    console.log('Update route - Cookie check:', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0
    });

    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const userRes = await fetch('https://id.nycu.edu.tw/api/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const userData = await userRes.json();
    // add userData.username to data
    console.log("user data:", userData);
    data.userid = userData.username;
    
    console.log('Calling backend with:', {
      url: `${process.env.BACK_URL}/api/save-data`,
      headers: headers,
      dataKeys: Object.keys(data)
    });
    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/save-data`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });
    console.log('Backend response status:', response.status);
    console.log('Backend response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to save or update data');
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error saving or updating data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save or update data' },
      { status: 500 }
    );
  }
}
