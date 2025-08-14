import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { goal, status } = await request.json();
    
    if (!goal || !status) {
      return NextResponse.json({ error: 'Goal and status are required' }, { status: 400 });
    }

    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/generate-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal, status }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate milestones');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating milestones:', error);
    return NextResponse.json(
      { error: 'Failed to generate milestones' },
      { status: 500 }
    );
  }
}
