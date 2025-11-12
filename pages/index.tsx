// pages/index.tsx
import { useState, useEffect, useRef } from 'react';

interface Song {
  id: string;
  name: string;
  preview_url: string;
  album: {
    name: string;
    images: { url: string }[];
  };
}

export default function Home() {
  const [token, setToken] = useState<string>('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Game state
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [guessedSong, setGuessedSong] = useState<Song | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const PLAYLIST_ID = '4omM8xYRuisPGb5rpclpUc';

  // Get token and fetch ALL playlist songs with pagination
  useEffect(() => {
    async function initialize() {
  try {
    const tokenRes = await fetch('/api/token');
    const { access_token } = await tokenRes.json();
    setToken(access_token);
    (window as any).mySpotifyToken = access_token;

    let allTracks: any[] = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100&market=US`;  // Added &market=US

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: { "Authorization": `Bearer ${access_token}` }
      });
      const data = await response.json();
      allTracks = [...allTracks, ...data.items];
      nextUrl = data.next;
    }

    const tracks = allTracks.map((item: any) => item.track);
    setAllSongs(tracks);
    setLoading(false);
    console.log(`✅ Loaded all ${tracks.length} songs from playlist`);
    
    // Debug: check previews
    const withPreview = tracks.filter((t: any) => t.preview_url);
    console.log(`Songs with preview: ${withPreview.length} out of ${tracks.length}`);
  } catch (error) {
    console.error('Error:', error);
    setLoading(false);
  }
}

    initialize();
  }, []);

  // Filter songs based on search query
  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredSongs([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allSongs
      .filter(song => song.name.toLowerCase().includes(query))
      .slice(0, 10);

    setFilteredSongs(filtered);
    setShowDropdown(true);
  }, [searchQuery, allSongs]);

  useEffect(() => {
  if (allSongs.length > 0) {
    console.log('First song:', allSongs[0]);
    console.log('Preview URL:', allSongs[0].preview_url);
    
    const songsWithPreview = allSongs.filter(song => song.preview_url);
    console.log(`Songs with preview: ${songsWithPreview.length} out of ${allSongs.length}`);
  }
}, [allSongs]);

  const playRandomSnippet = () => {
    // Reset game state
    setResult(null);
    setGuessedSong(null);
    setSearchQuery('');
    
    // Pick random song with preview
    const songsWithPreview = allSongs.filter(song => song.preview_url);
    if (songsWithPreview.length === 0) {
      alert('No songs with previews available!');
      return;
    }
    
    const randomSong = songsWithPreview[Math.floor(Math.random() * songsWithPreview.length)];
    setCurrentSong(randomSong);
    
    // Play 0.5 seconds from random point
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(randomSong.preview_url);
    audioRef.current = audio;
    
    const randomStart = Math.random() * 29.5; // Preview is 30s, leave 0.5s at end
    audio.currentTime = randomStart;
    audio.play();
    
    setTimeout(() => {
      audio.pause();
    }, 500); // Play for 0.5 seconds
  };

  const handleSelectSong = (song: Song) => {
    setGuessedSong(song);
    setSearchQuery(song.name);
    setShowDropdown(false);
    
    // Check if correct
    if (currentSong && song.id === currentSong.id) {
      setResult('correct');
    } else {
      setResult('wrong');
    }
  };

  const getBackgroundColor = () => {
    if (result === 'correct') return '#00ff00';
    if (result === 'wrong') return '#ff0000';
    return 'black';
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      backgroundColor: getBackgroundColor(),
      minHeight: '100vh',
      transition: 'background-color 0.3s'
    }}>
      <h1>Billy Joeldle</h1>
      {loading ? (
        <p style={{ color: '#aaa', fontSize: '14px' }}>Loading songs...</p>
      ) : (
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          {allSongs.length} songs loaded
        </p>
      )}
      
      <button
        onClick={playRandomSnippet}
        disabled={loading}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
          opacity: loading ? 0.5 : 1
        }}
      >
        🎵 Play Random 0.5s Snippet
      </button>

      {currentSong && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => filteredSongs.length > 0 && setShowDropdown(true)}
              placeholder="Guess the song..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid white',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: 'black',
                color: 'white'
              }}
            />
            
            {showDropdown && filteredSongs.length > 0 && (
              <div style={{
                position: 'absolute',
                width: '100%',
                maxHeight: '400px',
                overflowY: 'auto',
                backgroundColor: 'black',
                border: '1px solid white',
                borderRadius: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(255,255,255,0.1)',
                zIndex: 1000
              }}>
                {filteredSongs.map(song => (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'black'}
                  >
                    {song.album.images[2] && (
                      <img 
                        src={song.album.images[2].url} 
                        alt={song.album.name}
                        style={{ width: '40px', height: '40px' }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{song.name}</div>
                      <div style={{ fontSize: '14px', color: '#aaa' }}>{song.album.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {result && guessedSong && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          border: '2px solid white', 
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <h2>{result === 'correct' ? '✅ Correct!' : '❌ Wrong!'}</h2>
          <p><strong>You guessed:</strong> {guessedSong.name}</p>
          {result === 'wrong' && currentSong && (
            <p><strong>Correct answer:</strong> {currentSong.name}</p>
          )}
          {currentSong && (
            <div style={{ marginTop: '15px' }}>
              <p>Listen to the full preview:</p>
              <audio controls src={currentSong.preview_url} style={{ width: '100%' }} />
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div 
          onClick={() => setShowDropdown(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
}

{/* <h1>BILLY JOELDLE</h1>
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
        </div> */}



