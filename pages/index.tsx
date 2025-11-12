import GuessBox from "../components/GuessBox";
import { useState, useEffect } from 'react';

interface Artist {
  name: string;
  id: string;
  images: { url: string }[];
  followers: { total: number };
}

export default function Home() {
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    async function fetchArtist() {
      // Get token
      const tokenRes = await fetch('/api/token');
      const { access_token } = await tokenRes.json();

      // Search for artist
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=ACDC&type=artist&limit=1`,
        {
          headers: { "Authorization": `Bearer ${access_token}` }
        }
      );
      const data = await searchRes.json();
      
      setArtist(data.artists.items[0]);
    }

    fetchArtist();
  }, []);

  return (
    <>
    <h1>BILLY JOELDLE</h1>
        <p>THE DAILY BILLY JOEL SONG GUESSING GAME</p>
        <div id="flex-container">
                <div id="circle"></div>
                <div id="circle"></div>
                <div id="circle"></div>
                <div id="circle"></div>
                <div id="circle"></div>
            </div>
        <p>SONG 1/5</p>
        <div id="flex-container">
        <GuessBox/>
        </div>
        <div>
      <h1>Artist Search</h1>
      {artist ? (
        <div>
          <h2>{artist.name}</h2>
          {artist.images[0] && <img src={artist.images[0].url} alt={artist.name} width={300} />}
          <p>Followers: {artist.followers.total.toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </>
  );
}