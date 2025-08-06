import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectUri = `${process.env.DOMAIN_URL}/api/auth/callback`;

  const tokenRes = await fetch('https://id.nycu.edu.tw/o/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: code || '',
      client_id: process.env.NYCU_CLIENT_ID!,
      client_secret: process.env.NYCU_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const tokenData = await tokenRes.json();
  console.log('OAuth Token Response:', {
    access_token_length: tokenData.access_token?.length,
    token_type: tokenData.token_type,
    expires_in: tokenData.expires_in
  });

  const userRes = await fetch('https://id.nycu.edu.tw/api/profile', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const userData = await userRes.json();
  console.log('User Data from NYCU:', userData);

  const user_creation = await fetch(`${process.env.BACK_URL}/create-user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.username,
      email: userData.email
    })
  });

  if (user_creation.ok) {
    console.log('User created successfully, setting cookie...');
    // Store token in secure HTTP-only cookie or return it to frontend
    const response = NextResponse.redirect(`${process.env.BACK_URL}/welcome`);
    response.cookies.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    console.log('Cookie set with token length:', tokenData.access_token?.length);
    return response;
  } else {
    console.error('Failed to create user');
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }

  // return NextResponse.json({token: tokenData.access_token, user_id: userData.username, email: userData.email});
}