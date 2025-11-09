import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaStar, FaPlus, FaVolumeUp, FaClosedCaptioning } from 'react-icons/fa';
import MovieDetailModal from './MovieDetailModal';

const Header = ({ data, onPlayClick }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  // Determine content type and extract relevant information
  const isMovie = data.title && data.release_date;
  const isTVShow = data.name && data.first_air_date;
  const isPerson = data.name && data.known_for_department;
  
  const title = data.title || data.name || "";
  const description = data.overview || data.biography || "";
  const date = data.release_date || data.first_air_date || "";
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "";
  const genres = data.genres ? data.genres.map(g => g.name).join(' • ') : "";

  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick(data);
    }
  };

  const handleMoreInfo = () => {
    setShowModal(true);
  };

  return (
    <div 
      className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden"
      style={{
        background: `linear-gradient(to top, rgba(13, 9, 23, 0.95) 5%, rgba(13, 9, 23, 0.7) 20%, rgba(13, 9, 23, 0.4) 40%, rgba(13, 9, 23, 0.2) 60%, transparent), 
                     url(https://image.tmdb.org/t/p/original/${data.backdrop_path || data.profile_path || ''})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0917] to-transparent z-10"></div>
      
      {/* Content container */}
      <div className="relative z-20 h-full flex flex-col justify-end p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl">
          {/* Title and badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
              {title}
            </h1>
            
            {rating && (
              <div className="flex items-center gap-1 bg-[#6556CD]/80 px-3 py-1 rounded-full text-amber-300 font-bold">
                <FaStar className="text-xs" />
                <span>{rating}</span>
              </div>
            )}
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-300 mb-6">
            {date && (
              <span className="flex items-center gap-2">
                <FaCalendarAlt className="text-purple-400" />
                {new Date(date).getFullYear()}
              </span>
            )}
            
            {genres && (
              <span className="flex items-center gap-2">
                <FaFilm className="text-purple-400" />
                {genres}
              </span>
            )}
            
            {isPerson && data.known_for_department && (
              <span className="flex items-center gap-2">
                <FaUsers className="text-purple-400" />
                {data.known_for_department}
              </span>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-zinc-300 mb-6 max-w-2xl text-sm md:text-base line-clamp-3">
              {description}
            </p>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {!isPerson && (
              <button 
                onClick={handlePlayClick}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-5 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <FaPlay className="text-sm" />
                <span>Play Trailer</span>
              </button>
            )}
            
            {!isPerson && (
              <button 
                onClick={handleMoreInfo}
                className="flex items-center gap-2 bg-[#1e1830] hover:bg-[#2a1f40] text-white px-5 py-3 rounded-lg font-medium transition-all duration-300 border border-[#6556CD]/30"
              >
                <FaInfoCircle className="text-sm" />
                <span>More Info</span>
              </button>
            )}
            
            <button className="flex items-center justify-center w-12 h-12 bg-[#1e1830] hover:bg-[#2a1f40] text-white rounded-full transition-all duration-300 border border-[#6556CD]/30">
              <FaPlus />
            </button>
          </div>
          
          {/* Additional features */}
          <div className="flex items-center gap-4 text-zinc-400 text-sm">
            <div className="flex items-center gap-1">
              <FaVolumeUp className="text-[#6556CD]" />
              <span>English</span>
            </div>
            <div className="flex items-center gap-1">
              <FaClosedCaptioning className="text-[#6556CD]" />
              <span>Subtitles</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating badges for additional info */}
      {isPerson && (
        <div className="absolute top-4 right-4 z-30 bg-[#1e1830]/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-[#6556CD]/30">
          Popularity: {data.popularity?.toFixed(0) || "N/A"}
        </div>
      )}
      
      {isMovie && data.runtime && (
        <div className="absolute top-4 right-4 z-30 bg-[#1e1830]/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-[#6556CD]/30">
          {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
        </div>
      )}
      
      {isTVShow && data.number_of_seasons && (
        <div className="absolute top-4 right-4 z-30 bg-[#1e1830]/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-[#6556CD]/30">
          {data.number_of_seasons} season{data.number_of_seasons > 1 ? 's' : ''}
        </div>
      )}

      {/* Movie Detail Modal */}
      {showModal && (
        <MovieDetailModal
          item={data}
          onClose={() => setShowModal(false)}
          onPlayClick={onPlayClick}
        />
      )}
    </div>
  );
};

// CalendarAlt icon component
const FaCalendarAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M148 288h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12zm108-12v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 96v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm-96 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm192 0v-40c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12zm96-260v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z"></path>
  </svg>
);

// Film icon component
const FaFilm = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M488 64h-8v20c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V64H96v20c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12V64h-8C10.7 64 0 74.7 0 88v336c0 13.3 10.7 24 24 24h8v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h320v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h8c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24zM96 372c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm272 208c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm0-168c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm112 152c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40z"></path>
  </svg>
);

// Users icon component
const FaUsers = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"></path>
  </svg>
);

export default Header;