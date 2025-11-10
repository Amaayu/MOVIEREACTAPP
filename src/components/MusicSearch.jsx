import React, { useState } from 'react';
import { FaSearch, FaPlay, FaClock, FaUser } from 'react-icons/fa';
import axios from 'axios';

// API base URL - in production VITE_API_URL is '/api', in dev it's 'http://localhost:3000'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MusicSearch = ({ onTrackSelect }) => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Debug: Log API configuration
  console.log('🎵 MusicSearch loaded');
  console.log('🎵 VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🎵 PROD mode:', import.meta.env.PROD);
  console.log('🎵 API_BASE:', API_BASE);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log('🎵 Searching with API_BASE:', API_BASE);
      console.log('🎵 Full URL:', `${API_BASE}/music/search?q=${query}`);
      
      const response = await axios.get(`${API_BASE}/music/search`, {
        params: { q: query, limit: 20 }
      });

      console.log('🎵 Search response:', response.data);
      setTracks(response.data.tracks || []);
    } catch (err) {
      console.error('❌ Search error:', err);
      console.error('❌ Error response:', err.response);
      setError(err.response?.data?.error || err.message || 'Failed to search tracks');
    } finally {
      setIsSearching(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, artists..."
              className="w-full bg-[#2C2C34] text-zinc-200 px-12 py-3 rounded-lg outline-none focus:ring-2 focus:ring-[#6556CD] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-[#6556CD] hover:bg-[#7d6fd8] disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      {tracks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-300 mb-4">
            Search Results ({tracks.length})
          </h2>
          
          <div className="grid gap-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-[#2C2C34] hover:bg-[#353540] p-4 rounded-lg transition-all cursor-pointer group"
                onClick={() => onTrackSelect(track)}
              >
                <div className="flex items-center gap-4">
                  {/* Album Art */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {track.album_image ? (
                      <img
                        src={track.album_image}
                        alt={track.album_name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1F1E24] rounded flex items-center justify-center">
                        <FaPlay className="text-zinc-600 text-xl" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <FaPlay className="text-white text-xl" />
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-zinc-200 font-medium truncate">
                      {track.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-xs" />
                        {track.artist_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                    {track.album_name && (
                      <p className="text-xs text-zinc-600 mt-1 truncate">
                        {track.album_name}
                      </p>
                    )}
                  </div>

                  {/* Package Info */}
                  <div className="text-right text-xs text-zinc-600">
                    <div>{track.packageCount} chunks</div>
                    <div>{Math.round(track.packageSize / 1024)}KB each</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && tracks.length === 0 && !error && (
        <div className="text-center py-12 text-zinc-500">
          <FaSearch className="text-5xl mx-auto mb-4 opacity-50" />
          <p>Search for music to get started</p>
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
