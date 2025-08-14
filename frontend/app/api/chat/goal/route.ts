import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { goal } = await request.json();
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/generate-goal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate goal');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating goal:', error);
    return NextResponse.json(
      { error: 'Failed to generate goal' },
      { status: 500 }
    );
  }
}
