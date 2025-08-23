import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    const userRes = await fetch('https://id.nycu.edu.tw/api/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const userData = await userRes.json();
    console.log("user data:", userData);

    // Transform userData to match backend User model
    const userPayload = {
      user_id: userData.username,  // Map username to user_id
      email: userData.email
    };

    const response = await fetch(`${process.env.BACK_URL}/api/load-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userPayload),
    });
    console.log("backend response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Backend data:", data);
    
    // Extract events from the response since backend returns {user_id, events}
    const events = data.events?.data || [];
    console.log("Extracted events:", events);
    
    return NextResponse.json(events); // Return just the events array
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check cookies',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}