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
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const PLAYLIST_ID = '4omM8xYRuisPGb5rpclpUc';

  // Get token and fetch playlist on mount
  useEffect(() => {
    async function initialize() {
      try {
        // Get token
        const tokenRes = await fetch('/api/token');
        const { access_token } = await tokenRes.json();
        setToken(access_token);

        // Fetch all songs from the playlist
        const playlistRes = await fetch(
          `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
          {
            headers: { "Authorization": `Bearer ${access_token}` }
          }
        );
        const playlistData = await playlistRes.json();
        
        // Extract track info
        const tracks = playlistData.items.map((item: any) => item.track);
        setAllSongs(tracks);
        console.log(`Loaded ${tracks.length} songs from playlist`);
      } catch (error) {
        console.error('Error:', error);
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
      .slice(0, 10); // Limit to 10 results

    setFilteredSongs(filtered);
    setShowDropdown(true);
  }, [searchQuery, allSongs]);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setSearchQuery(song.name);
    setShowDropdown(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Billy Joel Song Search</h1>
      <p style={{ color: '#aaa', fontSize: '14px' }}>
        Searching {allSongs.length} songs from Complete Collection
      </p>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => filteredSongs.length > 0 && setShowDropdown(true)}
          placeholder="Search for a Billy Joel song..."
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

      {selectedSong && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid white', borderRadius: '8px' }}>
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



