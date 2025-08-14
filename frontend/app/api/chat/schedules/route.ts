import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { missions, today } = await request.json();
    
    if (!missions) {
      return NextResponse.json({ error: 'Missions are required' }, { status: 400 });
    }

    const currentDate = today || new Date().toISOString().split('T')[0];

    // Call your Python backend
    const response = await fetch(`${process.env.BACK_URL}/api/generate-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ missions, today: currentDate }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate schedules');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating schedules:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedules' },
      { status: 500 }
    );
  }
}
