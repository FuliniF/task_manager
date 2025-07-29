import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectUri = 'http://goalreacher.me/api/auth/callback';

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

  const userRes = await fetch('https://id.nycu.edu.tw/api/profile', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`
    }
  });
  const userData = await userRes.json();

  const user_creation = await fetch('http://127.0.0.1:5000/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.username,
      token: tokenData.access_token,
      email: userData.email
    })
  });

  return user_creation.ok
    ? NextResponse.json({ message: 'User created successfully!' })
    : NextResponse.json({ message: 'Failed to create user' }, { status: 500 });

  // return NextResponse.json({token: tokenData.access_token, user_id: userData.username, email: userData.email});
}