import { useState, useEffect } from 'react';
import { FaMusic, FaPlay, FaFire, FaStar, FaClock, FaGuitar, FaHeadphones } from 'react-icons/fa';
import { RiMusic2Fill } from 'react-icons/ri';
import axios from 'axios';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import MusicPlayer from './MusicPlayer';

// API base URL
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

const Music = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [chillTracks, setChillTracks] = useState([]);
  const [workoutTracks, setWorkoutTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all tracks on mount
  useEffect(() => {
    fetchAllTracks();
    loadRecentlyPlayed();
  }, []);

  // Save to recently played when track changes
  useEffect(() => {
    if (currentTrack) {
      saveToRecentlyPlayed(currentTrack);
    }
  }, [currentTrack]);

  const fetchAllTracks = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Fetch personalized recommendations if logged in
      if (token) {
        try {
          const recommendationsResponse = await axios.get(`${API_BASE}/api/music/recommendations?limit=12`, { headers });
          setRecommendedTracks(recommendationsResponse.data.recommendations);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        }
      }
      
      // Fetch all categories in parallel
      const [trending, popular, featured, chill, workout] = await Promise.all([
        axios.get(`${API_BASE}/api/music/search?q=hits`),
        axios.get(`${API_BASE}/api/music/search?q=popular`),
        axios.get(`${API_BASE}/api/music/search?q=top`),
        axios.get(`${API_BASE}/api/music/search?q=chill`),
        axios.get(`${API_BASE}/api/music/search?q=workout`)
      ]);
      
      setTrendingTracks(trending.data.tracks.slice(0, 12));
      setPopularTracks(popular.data.tracks.slice(0, 12));
      setFeaturedTracks(featured.data.tracks.slice(0, 12));
      setChillTracks(chill.data.tracks.slice(0, 12));
      setWorkoutTracks(workout.data.tracks.slice(0, 12));
      
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentlyPlayed = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Load from database if logged in
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const response = await axios.get(`${API_BASE}/api/music/history/recent?limit=12`, { headers });
          setRecentlyPlayed(response.data.tracks);
          return;
        } catch (error) {
          console.error('Error loading history from database:', error);
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('recentlyPlayed');
      if (saved) {
        setRecentlyPlayed(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recently played:', error);
    }
  };

  const saveToRecentlyPlayed = async (track) => {
    try {
      const token = localStorage.getItem('token');
      
      // Save to database if logged in
      if (token) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          await axios.post(`${API_BASE}/api/music/history`, {
            trackId: track.id,
            trackName: track.name,
            artistName: track.artist_name,
            albumName: track.album_name,
            albumImage: track.album_image,
            duration: track.duration,
            playDuration: 0, // Will be updated when track finishes
            completed: false,
            skipped: false
          }, { headers });
        } catch (error) {
          console.error('Error saving to database:', error);
        }
      }
      
      // Also save to localStorage as backup
      let recent = [...recentlyPlayed];
      
      // Remove if already exists
      recent = recent.filter(t => t.id !== track.id);
      
      // Add to beginning
      recent.unshift(track);
      
      // Keep only last 12
      recent = recent.slice(0, 12);
      
      setRecentlyPlayed(recent);
      localStorage.setItem('recentlyPlayed', JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving recently played:', error);
    }
  };

  // Handle music search from Topnav
  const handleMusicSearch = async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/api/music/search?q=${encodeURIComponent(query)}`);
      // Add type field to identify as music tracks
      return response.data.tracks.map(track => ({
        ...track,
        type: 'track'
      }));
    } catch (error) {
      console.error('Error searching music:', error);
      return [];
    }
  };

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
    setShouldAutoplay(true); // Signal that this was a user click
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav 
          onMusicSearch={handleMusicSearch}
          onMusicSelect={handleTrackSelect}
        />
        
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8 pb-32">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-3 rounded-xl">
                <FaMusic className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Music Hub</h1>
                <p className="text-zinc-400 text-sm">Stream with advanced chunked loading</p>
              </div>
            </div>
            <button
              onClick={fetchAllTracks}
              className="bg-[#1e1830] backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-[#6556CD]/30 hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all duration-300"
            >
              Refresh All
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
            </div>
          ) : (
            <>
              {/* Recently Played Section */}
              {recentlyPlayed.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FaClock className="text-amber-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Recently Played
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {recentlyPlayed.map((track) => (
                      <TrackCard 
                        key={`recent-${track.id}`}
                        track={track}
                        currentTrack={currentTrack}
                        onSelect={handleTrackSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended For You Section - Only for logged in users */}
              {recommendedTracks.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FaStar className="text-amber-400" />
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Recommended For You
                    </h2>
                    <span className="text-xs text-zinc-400 bg-[#1e1830] px-2 py-1 rounded-full">
                      Personalized
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {recommendedTracks.map((track) => (
                      <TrackCard 
                        key={`recommended-${track.id}`}
                        track={track}
                        currentTrack={currentTrack}
                        onSelect={handleTrackSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Hits Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FaFire className="text-orange-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Trending Hits
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {trendingTracks.map((track) => (
                    <TrackCard 
                      key={`trending-${track.id}`}
                      track={track}
                      currentTrack={currentTrack}
                      onSelect={handleTrackSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Popular Right Now Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-pink-500">🎧</div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Popular Right Now
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {popularTracks.map((track) => (
                    <TrackCard 
                      key={`popular-${track.id}`}
                      track={track}
                      currentTrack={currentTrack}
                      onSelect={handleTrackSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Featured Artists Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-purple-500">⭐</div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Featured Artists
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {featuredTracks.map((track) => (
                    <TrackCard 
                      key={`featured-${track.id}`}
                      track={track}
                      currentTrack={currentTrack}
                      onSelect={handleTrackSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Chill Vibes Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-blue-400">🌊</div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Chill Vibes
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {chillTracks.map((track) => (
                    <TrackCard 
                      key={`chill-${track.id}`}
                      track={track}
                      currentTrack={currentTrack}
                      onSelect={handleTrackSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Workout Energy Section */}
              {workoutTracks.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-red-500">💪</div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Workout Energy
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {workoutTracks.map((track) => (
                      <TrackCard 
                        key={`workout-${track.id}`}
                        track={track}
                        currentTrack={currentTrack}
                        onSelect={handleTrackSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State - Only show if no tracks loaded */}
              {trendingTracks.length === 0 && popularTracks.length === 0 && featuredTracks.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-amber-500 text-5xl mb-4">🎵</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No tracks available</h3>
                  <p className="text-zinc-400 max-w-md mx-auto">
                    Use the search bar above to find and play music
                  </p>
                </div>
              )}
            </>
          )}

          {/* Player Component */}
          {currentTrack && (
            <MusicPlayer 
              track={currentTrack}
              autoplay={shouldAutoplay}
              onClose={() => {
                setCurrentTrack(null);
                setShouldAutoplay(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Track Card Component
const TrackCard = ({ track, currentTrack, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(track)}
      className="group bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#6556CD]/20 hover:border-amber-500/30 max-w-[200px] mx-auto w-full"
    >
      {/* Album Art */}
      <div className="relative aspect-square overflow-hidden">
        {track.album_image ? (
          <img
            src={track.album_image}
            alt={track.album_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/20 to-red-900/30 flex items-center justify-center">
            <FaMusic className="text-4xl text-amber-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1125] to-transparent"></div>
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
            <FaPlay className="text-white ml-1" />
          </div>
        </div>
        
        {/* Currently Playing Indicator */}
        {currentTrack?.id === track.id && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
        )}
      </div>

      {/* Track Info */}
      <div className="p-2">
        <h3 className="text-sm font-bold text-white truncate mb-1 group-hover:text-amber-400 transition-colors">
          {track.name}
        </h3>
        <p className="text-zinc-400 text-[10px] truncate">
          {track.artist_name}
        </p>
        {track.album_name && (
          <p className="text-zinc-500 text-[10px] truncate mt-1">
            {track.album_name}
          </p>
        )}
      </div>
    </div>
  );
};

export default Music;
