import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import { 
  RiSearchLine, 
  RiCloseLine, 
  RiMovie2Line,
  RiTvLine,
  RiUserStarLine,
  RiLoader4Line,
  RiMusic2Line
} from 'react-icons/ri';

const Topnav = ({ onMusicSearch, onMusicSelect }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  
  const isMusicPage = location.pathname === '/music';

  const getSearchResults = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // If on music page, search for music
      if (isMusicPage && onMusicSearch) {
        const results = await onMusicSearch(query);
        setSearchResults(results || []);
      } else {
        // Otherwise search for movies/TV/people
        const { data } = await axios.get(`/search/multi?query=${query}`);
        setSearchResults(data.results.filter(item => 
          item.media_type !== 'person' || item.profile_path
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) getSearchResults();
      else setSearchResults([]);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchItemClick = (item) => {
    setQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    
    // If on music page and item is a track
    if (isMusicPage && item.type === 'track' && onMusicSelect) {
      onMusicSelect(item);
    } else if (item.media_type === 'movie') {
      navigate(`/movie/${item.id}`);
    } else if (item.media_type === 'tv') {
      navigate(`/tv/${item.id}`);
    } else if (item.media_type === 'person') {
      navigate(`/person/${item.id}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'movie': return <RiMovie2Line className="text-purple-500" />;
      case 'tv': return <RiTvLine className="text-blue-500" />;
      case 'person': return <RiUserStarLine className="text-amber-500" />;
      case 'track': return <RiMusic2Line className="text-green-500" />;
      default: return <RiMovie2Line />;
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-[#0d0917] border-b border-[#6556CD]/30 relative">

      {/* Search Container */}
      <div 
        ref={searchRef}
        className={`relative w-full max-w-xl transition-all duration-300 ${
          isSearchOpen ? 'z-50' : ''
        }`}
      >
        <div 
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
            isSearchOpen 
              ? 'bg-[#1e1830] border border-[#6556CD]/50 shadow-lg' 
              : 'bg-[#1a1125] hover:bg-[#1e1830]'
          }`}
          onClick={() => setIsSearchOpen(true)}
        >
          <RiSearchLine className="text-zinc-400 text-xl" />
          <input
            value={query}
            type="text"
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500"
            placeholder={isMusicPage ? "Search for songs..." : "Search movies, shows, people..."}
          />
          {query.length > 0 && (
            <button onClick={clearSearch} className="text-zinc-400 hover:text-white">
              <RiCloseLine className="text-xl" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && query.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-[#1e1830] rounded-xl shadow-2xl border border-[#6556CD]/30 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isSearching ? (
              <div className="flex justify-center items-center p-6">
                <RiLoader4Line className="animate-spin text-2xl text-[#6556CD]" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSearchItemClick(item)}
                  className="flex items-center gap-4 p-4 hover:bg-[#2a1f40] cursor-pointer transition-all duration-200 border-b border-[#6556CD]/10 last:border-0"
                >
                  <div className="flex-shrink-0">
                    {item.album_image || item.poster_path || item.profile_path ? (
                      <img
                        src={item.album_image || `https://image.tmdb.org/t/p/w92/${item.poster_path || item.profile_path}`}
                        alt={item.name || item.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6556CD]/20 to-[#9b8aff]/30 rounded-lg flex items-center justify-center">
                        {getMediaIcon(item.type || item.media_type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-white truncate">
                        {item.name || item.title || item.original_title || item.original_name}
                      </div>
                      <div className="flex-shrink-0">
                        {getMediaIcon(item.type || item.media_type)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span className="capitalize">{item.type === 'track' ? 'Song' : item.media_type}</span>
                      {item.artist_name && (
                        <span>• {item.artist_name}</span>
                      )}
                      {item.release_date && (
                        <span>• {new Date(item.release_date).getFullYear()}</span>
                      )}
                      {item.first_air_date && (
                        <span>• {new Date(item.first_air_date).getFullYear()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-zinc-400">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Toggle */}
      <button 
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="md:hidden text-zinc-300 p-2 rounded-full hover:bg-[#1e1830]"
      >
        <RiSearchLine className="text-xl" />
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6556CD;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1125;
        }
      `}</style>
    </div>
  );
};

export default Topnav;