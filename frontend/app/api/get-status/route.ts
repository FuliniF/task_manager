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

    const response = await fetch(`${process.env.BACK_URL}/api/back-get-status`, {
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
    console.log(data); // Process the response data
    return NextResponse.json(data); // <-- Added return statement to send the data back to the client
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check cookies',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}