import { useState, useEffect } from 'react';
import GuessBox from "../components/GuessBox";

export default function Home() {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/token')
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Token data:', data);
        setToken(data.access_token);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      });
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
      <h1>Spotify Access Token:</h1>
      <p>{token || 'Loading...'}</p>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
    </div>
    </>
  );
}
