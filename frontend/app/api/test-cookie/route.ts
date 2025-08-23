import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    
    return NextResponse.json({
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      allCookies: request.cookies.getAll().map(cookie => ({ 
        name: cookie.name, 
        hasValue: !!cookie.value 
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check cookies',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}