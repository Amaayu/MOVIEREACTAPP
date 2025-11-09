import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { RiCloseLine, RiGlobalLine } from 'react-icons/ri';

const VideoPlayer = ({ videoKey, onClose, title, allVideos = [] }) => {
  const [currentVideoKey, setCurrentVideoKey] = useState(videoKey);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  if (!videoKey) return null;

  // Group videos by language
  const videosByLanguage = allVideos.reduce((acc, video) => {
    const lang = video.iso_639_1 || 'en';
    const langName = getLanguageName(lang);
    if (!acc[lang]) {
      acc[lang] = { name: langName, videos: [] };
    }
    acc[lang].videos.push(video);
    return acc;
  }, {});

  // Get language name from code
  function getLanguageName(code) {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'hi': 'Hindi',
      'ar': 'Arabic',
      'ru': 'Russian'
    };
    return languages[code] || code.toUpperCase();
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
        setShowLanguageMenu(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleLanguageChange = (videoKey) => {
    setCurrentVideoKey(videoKey);
    setShowLanguageMenu(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top controls */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex gap-2">
        {/* Language selector - only show if multiple languages available */}
        {Object.keys(videosByLanguage).length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 md:p-3 bg-zinc-800/80 hover:bg-[#6556CD] text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Change language"
            >
              <RiGlobalLine className="text-xl md:text-2xl" />
            </button>
            
            {/* Language dropdown */}
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-2 bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden min-w-[200px]">
                <div className="p-2 border-b border-zinc-700">
                  <p className="text-white text-xs font-semibold">Select Language</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {Object.entries(videosByLanguage).map(([code, { name, videos }]) => (
                    <div key={code}>
                      <div className="px-3 py-2 text-zinc-400 text-xs font-semibold bg-zinc-800/50">
                        {name}
                      </div>
                      {videos.map((video) => (
                        <button
                          key={video.key}
                          onClick={() => handleLanguageChange(video.key)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            currentVideoKey === video.key
                              ? 'bg-[#6556CD] text-white'
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{video.type}</span>
                            {currentVideoKey === video.key && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 md:p-3 bg-zinc-800/80 hover:bg-[#6556CD] text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
          aria-label="Close video"
        >
          <RiCloseLine className="text-2xl md:text-3xl" />
        </button>
      </div>

      {/* Video container */}
      <div 
        className="w-full h-full md:h-auto max-w-7xl mx-auto p-4 md:p-8 flex flex-col justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && (
          <h2 className="text-white text-lg md:text-2xl font-bold mb-3 md:mb-4 text-center px-12">
            {title}
          </h2>
        )}

        {/* Video player wrapper */}
        <div className="relative w-full bg-black rounded-lg md:rounded-xl overflow-hidden shadow-2xl">
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <div className="absolute inset-0">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${currentVideoKey}`}
                width="100%"
                height="100%"
                controls
                playing
                key={currentVideoKey}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      cc_load_policy: 1
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Video info */}
        <div className="mt-3 md:mt-4 text-center">
          <div className="flex items-center justify-center gap-3 text-zinc-400 text-xs md:text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Now Playing
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Press ESC or click outside to close</span>
            <span className="md:hidden">Tap outside to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
