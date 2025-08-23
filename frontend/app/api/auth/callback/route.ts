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

  console.log('User creation response status:', user_creation.status);
  console.log('User creation response ok:', user_creation.ok);

  if (user_creation.ok) {
    const creationResult = await user_creation.json();
    console.log('User creation result:', creationResult);
    
    // Both "created" and "existing" are success cases
    console.log('User processed successfully, setting cookie...');
    
    // Add user status to redirect URL for better UX
    const redirectUrl = `${process.env.DOMAIN_URL}/welcome?status=${creationResult.status || 'success'}`;
    const response = NextResponse.redirect(redirectUrl);
    
    response.cookies.set('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 // 1 hour
    });
    console.log('Cookie set with token length:', tokenData.access_token?.length);
    return response;
  } else {
    // Get error details for debugging
    const errorResult = await user_creation.json().catch(() => ({ message: 'Unknown error' }));
    console.error('Failed to create user. Status:', user_creation.status);
    console.error('Error details:', errorResult);
    
    return NextResponse.json({ 
      message: 'Failed to create user', 
      status: user_creation.status,
      details: errorResult 
    }, { status: 500 });
  }

  // return NextResponse.json({token: tokenData.access_token, user_id: userData.username, email: userData.email});
}