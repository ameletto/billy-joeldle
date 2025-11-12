import GuessBox from "../components/GuessBox";
// pages/index.tsx
import { useState, useEffect } from 'react';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Get token on mount
  useEffect(() => {
    fetch('/api/token')
      .then(res => res.json())
      .then(data => setToken(data.access_token))
      .catch(err => console.error('Error:', err));
  }, []);

  // Search for songs with debouncing
  useEffect(() => {
    if (!token || searchQuery.length < 2) {
      setSongs([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery + ' artist:Billy Joel')}&type=track&limit=10`,
          {
            headers: { "Authorization": `Bearer ${token}` }
          }
        );
        const data = await response.json();
        
        // Filter to only Billy Joel songs
        const billyJoelSongs = data.tracks.items.filter((track: any) =>
          track.artists.some((artist: any) => 
            artist.name.toLowerCase() === 'billy joel'
          )
        );
        
        setSongs(billyJoelSongs);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setSearchQuery(song.name);
    setShowDropdown(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Billy Joel Song Search</h1>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => songs.length > 0 && setShowDropdown(true)}
          placeholder="Search for a Billy Joel song..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
        />
        
        {showDropdown && songs.length > 0 && (
          <div style={{
            position: 'absolute',
            width: '100%',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginTop: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            {songs.map(song => (
              <div
                key={song.id}
                onClick={() => handleSelectSong(song)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                  <div style={{ fontSize: '14px', color: '#666' }}>{song.album.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSong && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Selected Song:</h2>
          <h3>{selectedSong.name}</h3>
          <p>Album: {selectedSong.album.name}</p>
          {selectedSong.preview_url ? (
            <audio controls src={selectedSong.preview_url} style={{ width: '100%' }} />
          ) : (
            <p style={{ color: '#999' }}>No preview available</p>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
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



