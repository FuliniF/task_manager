import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    console.log('Access Token:', accessToken); // Debugging access token

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 401 }
      );
    }

    // Get user data to verify authentication
    const userRes = await fetch('https://id.nycu.edu.tw/api/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    console.log('User Response Status:', userRes.status); // Debugging user response status

    if (!userRes.ok) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const userData = await userRes.json();
    console.log('User Data:', userData); // Debugging user data

    const { eventId, isDone } = await request.json();
    console.log('Request Body:', { eventId, isDone }); // Debugging request body

    if (!eventId || typeof isDone !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing eventId or isDone parameter' },
        { status: 400 }
      );
    }

    // Call backend to toggle event status
    const backendResponse = await fetch(`${process.env.BACK_URL}/api/events/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_id: eventId,
        is_done: isDone,
        user_id: userData.username
      }),
    });
    console.log('Backend Response Status:', backendResponse.status); // Debugging backend response status

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Backend Error Data:', errorData); // Debugging backend error data
      return NextResponse.json(
        { error: 'Failed to toggle event status', details: errorData },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('Backend Response Result:', result); // Debugging backend response result
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error toggling event status:', error); // Debugging general errors
    return NextResponse.json({
      error: 'Failed to toggle event status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
