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

  return NextResponse.json({access_token: tokenData.access_token, username: userData.username, email: userData.email});
}