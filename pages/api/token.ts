// pages/api/token.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    console.log('Client ID exists?', !!clientId);
    console.log('Client Secret exists?', !!clientSecret);

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Missing credentials' });
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
      return res.status(response.status).json({ 
        error: data.error_description || 'Spotify API error' 
      });
    }

    return res.status(200).json({ access_token: data.access_token });
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}