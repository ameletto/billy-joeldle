import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    console.log('Client ID exists?', !!clientId); 
    console.log('Client Secret exists?', !!clientSecret); 

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 500 }
      );
    }

    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = Buffer.from(authString).toString('base64');

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authBase64}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    console.log('Spotify response status:', response.status); 

    const data = await response.json();
    console.log('Spotify response:', data); 

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error_description || 'Spotify API error' },
        { status: response.status }
      );
    }

    return NextResponse.json({ access_token: data.access_token });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
