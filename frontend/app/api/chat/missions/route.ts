import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { goal, status, milestones } = await request.json();
    
    if (!goal || !status || !milestones) {
      return NextResponse.json({ error: 'Goal, status, and milestones are required' }, { status: 400 });
    }

    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/generate-missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal, status, milestones }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate missions');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating missions:', error);
    return NextResponse.json(
      { error: 'Failed to generate missions' },
      { status: 500 }
    );
  }
}
