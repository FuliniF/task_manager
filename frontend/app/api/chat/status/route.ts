import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { goal, previous_status, user_description } = await request.json();
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/generate-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal, previous_status, user_description }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate status');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating status:', error);
    return NextResponse.json(
      { error: 'Failed to generate status' },
      { status: 500 }
    );
  }
}
