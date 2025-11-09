import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import api from '../utils/api';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { 
  FaStar, FaPlay, FaBookmark, FaHeart, 
  FaFilter, FaChevronDown, FaCalendarAlt,
  FaTv, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TVShows = () => {
  const [tvShows, setTVShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [likedItems, setLikedItems] = useState(new Set());
  const navigate = useNavigate();
  
  // Generate years from 2024 down to 1970
  const years = Array.from({ length: 55 }, (_, i) => 2024 - i);
  
  // Fetch genres for TV shows
  const getGenres = async () => {
    try {
      const { data } = await axios.get('/genre/tv/list');
      setGenres(data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };
  
  // Fetch TV shows
  const getTVShows = async () => {
    try {
      setIsLoading(true);
      let endpoint = '/discover/tv?';
      
      // Add genre filter if selected
      if (selectedGenre) {
        endpoint += `with_genres=${selectedGenre}&`;
      }
      
      // Add year filter if selected
      if (selectedYear) {
        endpoint += `first_air_date_year=${selectedYear}&`;
      }
      
      // Add sorting
      endpoint += `sort_by=${sortBy}`;
      
      const { data } = await axios.get(endpoint);
      setTVShows(data.results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching TV shows:', error);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    getGenres();
  }, []);
  
  useEffect(() => {
    getTVShows();
  }, [selectedGenre, selectedYear, sortBy]);

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
  const handleBookmark = async (show, e) => {
    e.stopPropagation();
    const itemKey = `${show.id}-tv`;
    
    try {
      if (bookmarkedItems.has(itemKey)) {
        await api.delete(`/bookmarks/${show.id}/tv`);
        setBookmarkedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        await api.post('/bookmarks', {
          mediaId: show.id,
          mediaType: 'tv',
          title: show.name,
          posterPath: show.poster_path,
          overview: show.overview,
          releaseDate: show.first_air_date,
          voteAverage: show.vote_average
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
  const handleLike = async (show, e) => {
    e.stopPropagation();
    const itemKey = `${show.id}-tv`;
    
    try {
      if (likedItems.has(itemKey)) {
        await api.delete(`/likes/${show.id}/tv`);
        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        await api.post('/likes', {
          mediaId: show.id,
          mediaType: 'tv',
          title: show.name,
          posterPath: show.poster_path,
          overview: show.overview,
          releaseDate: show.first_air_date,
          voteAverage: show.vote_average
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
  
  // Calculate stats
  const calculateStats = () => {
    const total = tvShows.length;
    const highlyRated = tvShows.filter(show => show.vote_average >= 7.5).length;
    const averageRating = total > 0 
      ? (tvShows.reduce((sum, show) => sum + show.vote_average, 0) / total).toFixed(1)
      : 0;
    
    return { total, highlyRated, averageRating };
  };
  
  const stats = calculateStats();
  
  // Handle TV show click
  const handleTVShowClick = (showId) => {
    navigate(`/tv/${showId}`);
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
          <div className="bg-gradient-to-r from-blue-600 to-[#4a86e8] p-3 rounded-xl">
            <FaTv className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">TV Show Collection</h1>
            <p className="text-zinc-400 text-sm">Explore our extensive TV show library</p>
          </div>
        </div>
        
        {/* Sort dropdown */}
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-zinc-300 text-sm mb-1 flex items-center gap-2">
            <FaFilter className="text-blue-500" /> Sort by
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 bg-[#1e1830] text-white px-4 py-3 rounded-xl border border-[#4a86e8]/30 outline-none shadow-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer appearance-none"
            >
              <option value="popularity.desc">Popularity (High to Low)</option>
              <option value="popularity.asc">Popularity (Low to High)</option>
              <option value="vote_average.desc">Rating (High to Low)</option>
              <option value="vote_average.asc">Rating (Low to High)</option>
              <option value="first_air_date.desc">Newest First</option>
              <option value="first_air_date.asc">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <FaChevronDown className="text-sm" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Genre filter */}
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-zinc-300 text-sm mb-1">Genre</label>
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full sm:w-48 bg-[#1e1830] text-white px-4 py-3 rounded-xl border border-[#4a86e8]/30 outline-none shadow-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer appearance-none"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <FaChevronDown className="text-sm" />
            </div>
          </div>
        </div>
        
        {/* Year filter */}
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-zinc-300 text-sm mb-1">First Air Year</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-32 bg-[#1e1830] text-white px-4 py-3 rounded-xl border border-[#4a86e8]/30 outline-none shadow-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 cursor-pointer appearance-none"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <FaChevronDown className="text-sm" />
            </div>
          </div>
        </div>
        
        {/* Reset filters button */}
        <div className="flex flex-col justify-end w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedGenre('');
              setSelectedYear('');
            }}
            className="h-full bg-[#1e1830] hover:bg-[#2a1f40] text-zinc-300 px-4 py-3 rounded-xl border border-[#4a86e8]/30 outline-none shadow-lg hover:text-white transition-all duration-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#4a86e8]/20">
          <div className="text-blue-400 font-bold text-2xl">{stats.total}</div>
          <div className="text-zinc-400 text-sm mt-1">Total Shows</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#4a86e8]/20">
          <div className="text-blue-400 font-bold text-2xl">{stats.highlyRated}</div>
          <div className="text-zinc-400 text-sm mt-1">Highly Rated</div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-4 border border-[#4a86e8]/20">
          <div className="text-blue-400 font-bold text-2xl">{stats.averageRating}</div>
          <div className="text-zinc-400 text-sm mt-1">Avg. Rating</div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
      
      {/* TV Shows grid */}
      {!isLoading && tvShows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {tvShows.map((show) => (
            <div
              key={show.id}
              className="group bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#4a86e8]/20 hover:border-blue-500/30 max-w-[200px] mx-auto w-full"
            >
              {/* TV show poster */}
              <div className="relative overflow-hidden aspect-[2/3]">
                {show.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${show.poster_path}`}
                    alt={show.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-[#4a86e8]/30 flex items-center justify-center">
                    <div className="text-blue-500 text-4xl">📺</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1125] to-transparent"></div>
                
                {/* Rating badge */}
                <div className="absolute top-2 right-2 bg-[#1a1125]/80 text-blue-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                  <FaStar className="text-[8px]" />
                  <span>{show.vote_average.toFixed(1)}</span>
                </div>
              </div>
              
              {/* TV show info */}
              <div className="p-2">
                <h2 className="text-sm font-bold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">
                  {show.name}
                </h2>
                
                <div className="flex items-center text-zinc-400 text-[10px] mb-2">
                  <span>
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Unknown year'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center gap-1">
                  <button 
                    onClick={() => handleTVShowClick(show.id)}
                    className="flex items-center gap-1 text-[10px] bg-gradient-to-r from-[#4a86e8] to-[#6ea1ff] hover:from-[#3a76d8] hover:to-[#5e91ef] text-white px-2 py-1 rounded-md transition-all duration-300"
                  >
                    <FaPlay className="text-[8px]" />
                    <span>Play</span>
                  </button>
                  
                  <div className="flex gap-1 text-zinc-500">
                    <button 
                      onClick={(e) => handleBookmark(show, e)}
                      className={`transition-colors p-1 rounded-full ${
                        bookmarkedItems.has(`${show.id}-tv`)
                          ? 'text-blue-400 bg-blue-900/20'
                          : 'hover:text-blue-400 hover:bg-blue-900/20'
                      }`}
                    >
                      <FaBookmark className="text-xs" />
                    </button>
                    <button 
                      onClick={(e) => handleLike(show, e)}
                      className={`transition-colors p-1 rounded-full ${
                        likedItems.has(`${show.id}-tv`)
                          ? 'text-red-400 bg-red-900/20'
                          : 'hover:text-blue-400 hover:bg-blue-900/20'
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
      {!isLoading && tvShows.length === 0 && (
        <div className="text-center py-16">
          <div className="text-blue-500 text-5xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">No TV Shows Found</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            Try adjusting your filters or check back later for new additions.
          </p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default TVShows;