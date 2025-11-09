import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import api from '../utils/api';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { 
  FaStar, FaPlay, FaBookmark, FaHeart, FaFire, 
  FaFilter, FaChevronDown, FaCalendarAlt
} from 'react-icons/fa';

const Trending = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());

  const getTrending = async (type = 'all') => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/trending/${type}/day`);
      setTrending(data.results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trending:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTrending(selectedType);
  }, [selectedType]);

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

  // Handle bookmark
  const handleBookmark = async (item, e) => {
    e.stopPropagation();
    const mediaType = item.media_type || selectedType;
    const itemKey = `${item.id}-${mediaType}`;
    
    try {
      if (bookmarkedItems.has(itemKey)) {
        await api.delete(`/bookmarks/${item.id}/${mediaType}`);
        setBookmarkedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        await api.post('/bookmarks', {
          mediaId: item.id,
          mediaType: mediaType,
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
    const mediaType = item.media_type || selectedType;
    const itemKey = `${item.id}-${mediaType}`;
    
    try {
      if (likedItems.has(itemKey)) {
        await api.delete(`/likes/${item.id}/${mediaType}`);
        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        await api.post('/likes', {
          mediaId: item.id,
          mediaType: mediaType,
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMediaTypeText = (mediaType) => {
    switch(mediaType) {
      case 'movie': return 'Movie';
      case 'tv': return 'TV Show';
      case 'person': return 'Person';
      default: return 'Media';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950">
      <Sidbar />
      <div className="w-full flex-1 flex flex-col">
        <Topnav />
        <div className="flex-grow overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-amber-500 to-red-600 p-3 rounded-xl">
            <FaFire className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Trending Today</h1>
            <p className="text-zinc-400 text-sm">Discover what's popular right now</p>
          </div>
        </div>
        
        {/* Filter dropdown */}
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-zinc-300 text-sm mb-1 flex items-center gap-2">
            <FaFilter className="text-amber-500" /> Filter by type
          </label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-48 bg-[#1e1830] backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-[#6556CD]/30 outline-none shadow-lg hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition-all duration-300 cursor-pointer appearance-none"
            >
              <option value='all'>🌍 All Media</option>
              <option value='movie'>🎬 Movies Only</option>
              <option value='tv'>📺 TV Shows Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <FaChevronDown className="text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#6556CD]/20">
          <div className="text-amber-400 font-bold text-2xl">{trending.length}</div>
          <div className="text-zinc-400 text-sm mt-1">Items Found</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#6556CD]/20">
          <div className="text-amber-400 font-bold text-2xl">
            {trending.filter(item => item.media_type === 'movie').length}
          </div>
          <div className="text-zinc-400 text-sm mt-1">Movies</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#6556CD]/20">
          <div className="text-amber-400 font-bold text-2xl">
            {trending.filter(item => item.media_type === 'tv').length}
          </div>
          <div className="text-zinc-400 text-sm mt-1">TV Shows</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#6556CD]/20">
          <div className="text-amber-400 font-bold text-2xl">
            {trending.filter(item => item.vote_average >= 7.5).length}
          </div>
          <div className="text-zinc-400 text-sm mt-1">Highly Rated</div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
        </div>
      )}

      {/* Trending cards grid */}
      {!isLoading && trending.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {trending.map((item, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#6556CD]/20 hover:border-amber-500/30 max-w-[200px] mx-auto w-full"
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
                        <div class="text-amber-500 text-4xl">
                          ${getMediaTypeText(item.media_type || selectedType).charAt(0)}
                        </div>
                      </div>
                    `;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1125] to-transparent"></div>
                
                {/* Media type badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {getMediaTypeText(item.media_type || selectedType)}
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
                <h2 className="text-sm font-bold text-white truncate mb-1 group-hover:text-amber-400 transition-colors">
                  {item.title || item.name || item.original_name}
                </h2>
                
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
                  <button className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-2 py-1 rounded-md transition-all duration-300">
                    <FaPlay className="text-[8px]" />
                    <span>Play</span>
                  </button>
                  
                  <div className="flex gap-1 text-zinc-500">
                    <button 
                      onClick={(e) => handleBookmark(item, e)}
                      className={`transition-colors p-1 rounded-full ${
                        bookmarkedItems.has(`${item.id}-${item.media_type || selectedType}`)
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'hover:text-blue-400 hover:bg-blue-900/20'
                      }`}
                    >
                      <FaBookmark className="text-xs" />
                    </button>
                    <button 
                      onClick={(e) => handleLike(item, e)}
                      className={`transition-colors p-1 rounded-full ${
                        likedItems.has(`${item.id}-${item.media_type || selectedType}`)
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
        <div className="text-center py-16">
          <div className="text-amber-500 text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Trending Content</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            We couldn't find any trending content. Try selecting a different category or check back later.
          </p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Trending;