import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = encodeURIComponent(`${process.env.DOMAIN_URL}/api/auth/callback`);
  const clientID = process.env.NYCU_CLIENT_ID;
  
  const url = `https://id.nycu.edu.tw/o/authorize/?` +
              `client_id=` + clientID +
              `&response_type=code` + 
              `&scope=profile` + 
              `&redirect_uri=` + redirectUri;

  return NextResponse.redirect(new URL(url));
}