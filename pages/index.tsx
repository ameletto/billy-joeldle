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
  const [loading, setLoading] = useState(true);

  const PLAYLIST_ID = '4omM8xYRuisPGb5rpclpUc';

  // Get token and fetch ALL playlist songs with pagination
  useEffect(() => {
    async function initialize() {
      try {
        // Get token
        const tokenRes = await fetch('/api/token');
        const { access_token } = await tokenRes.json();
        setToken(access_token);

        // Fetch all songs from the playlist with pagination
        let allTracks: any[] = [];
        let nextUrl = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?limit=100`;

        while (nextUrl) {
          const response = await fetch(nextUrl, {
            headers: { "Authorization": `Bearer ${access_token}` }
          });
          const data = await response.json();
          
          // Add tracks from this page
          allTracks = [...allTracks, ...data.items];
          
          // Get next page URL (null if no more pages)
          nextUrl = data.next;
          
          console.log(`Fetched ${allTracks.length} songs so far...`);
        }

        // Extract track info
        const tracks = allTracks.map((item: any) => item.track);
        setAllSongs(tracks);
        setLoading(false);
        console.log(`✅ Loaded all ${tracks.length} songs from playlist`);
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
      {loading ? (
        <p style={{ color: '#aaa', fontSize: '14px' }}>Loading songs...</p>
      ) : (
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          Searching {allSongs.length} songs from Complete Collection
        </p>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => filteredSongs.length > 0 && setShowDropdown(true)}
          placeholder="Search for a Billy Joel song..."
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid white',
            borderRadius: '8px',
            boxSizing: 'border-box',
            backgroundColor: 'black',
            color: 'white',
            opacity: loading ? 0.5 : 1
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



