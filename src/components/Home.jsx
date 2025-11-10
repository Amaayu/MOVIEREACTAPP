import React, { useEffect, useState } from 'react';
import axios from '../../src/utils/axios';
import api from '../utils/api';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import Header from './partials/Header';
import VideoPlayer from './partials/VideoPlayer';
import { FaStar, FaPlay, FaHeart, FaBookmark } from 'react-icons/fa';

const Home = () => {
  const [wallpaper, setWallpaper] = useState(null);
  const [trending, setTrending] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [allVideos, setAllVideos] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());

  const getWallpaper = async () => {
    try {
      const { data } = await axios.get(`/trending/all/day`);
      const randomData = data.results[Math.floor(Math.random() * data.results.length)];
      setWallpaper(randomData);
    } catch (error) {
      console.log(error);
    }
  };

  const getTrending = async (type = "all") => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/trending/${type}/day`);
      setTrending(data.results);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWallpaper();
    getTrending(selectedType);
  }, [selectedType]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch video/trailer
  const handlePlayClick = async (item) => {
    try {
      const mediaType = item.media_type === 'movie' ? 'movie' : 'tv';
      const { data } = await axios.get(`/${mediaType}/${item.id}/videos`);
      
      if (data.results && data.results.length > 0) {
        // Filter YouTube videos only
        const youtubeVideos = data.results.filter(video => video.site === 'YouTube');
        
        if (youtubeVideos.length === 0) {
          alert('No trailer available for this content');
          return;
        }
        
        // Find trailer or teaser
        const trailer = youtubeVideos.find(
          (video) => video.type === 'Trailer'
        ) || youtubeVideos.find(
          (video) => video.type === 'Teaser'
        ) || youtubeVideos[0];
        
        setSelectedVideo(trailer.key);
        setVideoTitle(item.title || item.name);
        setAllVideos(youtubeVideos);
      } else {
        alert('No trailer available for this content');
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Unable to load trailer');
    }
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setVideoTitle('');
    setAllVideos([]);
  };

  // Handle bookmark
  const handleBookmark = async (item, e) => {
    e.stopPropagation();
    const itemKey = `${item.id}-${item.media_type}`;
    
    try {
      if (bookmarkedItems.has(itemKey)) {
        // Remove bookmark
        await api.delete(`/bookmarks/${item.id}/${item.media_type}`);
        setBookmarkedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        // Add bookmark
        await api.post('/bookmarks', {
          mediaId: item.id,
          mediaType: item.media_type,
          title: item.title || item.name,
          posterPath: item.poster_path,
          overview: item.overview,
          releaseDate: item.release_date || item.first_air_date,
          voteAverage: item.vote_average
        });
        setBookmarkedItems(prev => new Set([...prev, itemKey]));
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      if (error.response?.status === 401) {
        alert('Please login to bookmark items');
      }
    }
  };

  // Handle like
  const handleLike = async (item, e) => {
    e.stopPropagation();
    const itemKey = `${item.id}-${item.media_type}`;
    
    try {
      if (likedItems.has(itemKey)) {
        // Remove like
        await api.delete(`/likes/${item.id}/${item.media_type}`);
        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        // Add like
        await api.post('/likes', {
          mediaId: item.id,
          mediaType: item.media_type,
          title: item.title || item.name,
          posterPath: item.poster_path,
          overview: item.overview,
          releaseDate: item.release_date || item.first_air_date,
          voteAverage: item.vote_average
        });
        setLikedItems(prev => new Set([...prev, itemKey]));
      }
    } catch (error) {
      console.error('Like error:', error);
      if (error.response?.status === 401) {
        alert('Please login to like items');
      }
    }
  };

  // Load bookmarks and likes on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [bookmarksRes, likesRes] = await Promise.all([
          api.get('/bookmarks'),
          api.get('/likes')
        ]);

        const bookmarks = new Set(
          bookmarksRes.data.bookmarks.map(b => `${b.mediaId}-${b.mediaType}`)
        );
        const likes = new Set(
          likesRes.data.likes.map(l => `${l.mediaId}-${l.mediaType}`)
        );

        setBookmarkedItems(bookmarks);
        setLikedItems(likes);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar/>
      
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        
        {/* Main content */}
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-6">
          {/* Hero section with wallpaper */}
          {wallpaper && <Header data={wallpaper} onPlayClick={handlePlayClick} />}
          
          {/* Trending section */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Trending Now
              </h2>
              
              {/* Type selector */}
              <div className="flex flex-col w-full sm:w-auto">
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full sm:w-48 bg-[#1e1830] backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-[#6556CD]/30 outline-none shadow-lg hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all duration-300 cursor-pointer appearance-none"
                  >
                    <option value="all">🌍 All Media</option>
                    <option value="movie">🎬 Movies Only</option>
                    <option value="tv">📺 TV Shows Only</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            )}
            
            {/* Trending cards grid */}

            {!isLoading && trending.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                
                {trending.map((item, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#6556CD]/20 hover:border-amber-500/30 max-w-[200px] mx-auto w-full"
                  >
                    {/* Image with overlay */}
                    <div className="relative overflow-hidden aspect-[2/3]">
                      <img
                        src={`https://image.tmdb.org/t/p/w500/${item.backdrop_path || item.poster_path || item.profile_path}`}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentNode.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-amber-900/20 to-red-900/30 flex items-center justify-center">
                              <div class="text-amber-500 text-3xl">
                                ${item.media_type === 'movie' ? '🎬' : 
                                  item.media_type === 'tv' ? '📺' : 
                                  item.media_type === 'person' ? '👤' : '🎭'}
                              </div>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1125] to-transparent"></div>
                      
                      {/* Media type badge */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.media_type === 'movie' ? 'Movie' : 
                         item.media_type === 'tv' ? 'TV' : 
                         item.media_type === 'person' ? 'Person' : 'Media'}
                      </div>
                      
                      {/* Rating badge */}
                      {item.vote_average && (
                        <div className="absolute top-2 right-2 bg-[#1a1125]/80 backdrop-blur-sm text-amber-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                          <FaStar className="text-[8px]" />
                          <span>{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-2">
                      <h3 className="text-sm font-bold text-white truncate mb-1 group-hover:text-amber-400 transition-colors">
                        {item.title || item.name || item.original_name}
                      </h3>
                      
                      <div className="flex items-center text-zinc-400 text-[10px] mb-2">
                        {item.release_date && (
                          <span>{formatDate(item.release_date)}</span>
                        )}
                        {item.first_air_date && (
                          <span>{formatDate(item.first_air_date)}</span>
                        )}
                        {item.known_for_department && (
                          <span>• {item.known_for_department}</span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center gap-1">
                        <button 
                          onClick={() => handlePlayClick(item)}
                          className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-2 py-1 rounded-md transition-all duration-300"
                        >
                          <FaPlay className="text-[8px]" />
                          <span>Play</span>
                        </button>
                        
                        <div className="flex gap-1 text-zinc-500">
                          <button 
                            onClick={(e) => handleBookmark(item, e)}
                            className={`transition-colors p-1 rounded-full ${
                              bookmarkedItems.has(`${item.id}-${item.media_type}`)
                                ? 'text-blue-400 bg-blue-900/20'
                                : 'hover:text-blue-400 hover:bg-blue-900/20'
                            }`}
                          >
                            <FaBookmark className="text-xs" />
                          </button>
                          <button 
                            onClick={(e) => handleLike(item, e)}
                            className={`transition-colors p-1 rounded-full ${
                              likedItems.has(`${item.id}-${item.media_type}`)
                                ? 'text-red-400 bg-red-900/20'
                                : 'hover:text-amber-400 hover:bg-amber-900/20'
                            }`}
                          >
                            <FaHeart className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Empty state */}
            {!isLoading && trending.length === 0 && (
              <div className="text-center py-12">
                <div className="text-amber-500 text-5xl mb-4">🍿</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Trending Content</h3>
                <p className="text-zinc-400 max-w-md mx-auto">
                  We couldn't find any trending content. Try selecting a different category or check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer 
          videoKey={selectedVideo} 
          onClose={closeVideo}
          title={videoTitle}
          allVideos={allVideos}
        />
      )}
    </div>
  );
};

export default Home;