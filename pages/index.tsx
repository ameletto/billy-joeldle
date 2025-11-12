import GuessBox from "../components/GuessBox";



// pages/index.tsx
import { useState, useEffect } from 'react';

interface Song {
  id: string;
  name: string;
  preview_url: string;
  external_urls: {
    spotify: string;
  };
}

function getAuthHeader(token: string) {
  return { "Authorization": `Bearer ${token}` };
}

async function searchForArtist(token: string, artistName: string) {
  const url = "https://api.spotify.com/v1/search";
  const headers = getAuthHeader(token);
  const query = `?q=${artistName}&type=artist&limit=1`;
  const queryUrl = url + query;
  
  const result = await fetch(queryUrl, { headers });
  const jsonResult = await result.json();
  
  return jsonResult.artists.items[0];
}

async function getSongsByArtist(token: string, artistId: string) {
  const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`;
  const headers = getAuthHeader(token);
  
  const result = await fetch(url, { headers });
  const jsonResult = await result.json();
  
  return jsonResult.tracks;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    async function fetchSongs() {
      // Get token
      const tokenRes = await fetch('/api/token');
      const { access_token } = await tokenRes.json();
      
      // Search for artist
      const artist = await searchForArtist(access_token, "Billy Joel");
      const artistId = artist.id;
      
      // Get songs by artist
      const tracks = await getSongsByArtist(access_token, artistId);
      console.log(tracks);
      setSongs(tracks);
    }

    fetchSongs();
  }, []);

  return (
    <><h1>BILLY JOELDLE</h1>
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
      <h1>Billy Joel Top Songs</h1>
      {songs.length > 0 ? (
        <ul>
          {songs.map(song => (
            <li key={song.id}>
              {song.name}
              {song.preview_url && (
                <audio controls src={song.preview_url} style={{ marginLeft: '10px' }} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading songs...</p>
      )}
    </div>
    </>
  );
}



