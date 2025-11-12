'use client';
import GuessBox from "../components/Guessbox";
import { useState, useEffect } from 'react';

export default function Home() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    fetch('/api/token')
      .then(res => res.json())
      .then(data => setToken(data.access_token));
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
        <h1>Spotify Access Token:</h1>
      <p>{token || 'Loading...'}</p>
        </>
  );
}