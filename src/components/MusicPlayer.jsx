import React, { useEffect, useState } from 'react';
import { 
  FaPlay, FaPause, FaTimes, FaVolumeUp, FaVolumeMute, 
  FaWifi, FaDownload, FaSpinner 
} from 'react-icons/fa';
import { RiWifiOffLine } from 'react-icons/ri';
import { useChunkedPlayer } from '../hooks/useChunkedPlayer';

const MusicPlayer = ({ track, autoplay = false, onClose }) => {
  const {
    manifest,
    isPlaying,
    currentTime,
    duration,
    bufferedRanges,
    isLoading,
    error,
    isOffline,
    downloadProgress,
    play,
    pause,
    seek,
    setVolume
  } = useChunkedPlayer(track.id);

  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setVolume(isMuted ? 0 : volume);
  }, [isMuted, volume, setVolume]);

  // Auto-play when track changes and autoplay is enabled
  useEffect(() => {
    if (!autoplay) return;
    
    let autoplayAttempted = false;
    let timeoutId;
    
    const attemptAutoplay = async () => {
      if (autoplayAttempted) return;
      
      // Wait for initialization
      timeoutId = setTimeout(async () => {
        if (!isLoading && !error) {
          autoplayAttempted = true;
          try {
            await play();
            console.log('✅ Autoplay successful');
          } catch (err) {
            console.log('⚠️ Autoplay prevented:', err.message);
          }
        }
      }, 800);
    };
    
    attemptAutoplay();
    
    // Cleanup
    return () => {
      autoplayAttempted = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [track.id, autoplay, isLoading, error, play]); // Trigger when track ID changes

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlayPause = async () => {
    // Prevent rapid clicking
    if (isLoading) return;
    
    try {
      if (isPlaying) {
        pause();
      } else {
        await play();
      }
    } catch (err) {
      console.error('Toggle play/pause error:', err);
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-[#1e1830] to-[#2a1f40] border-t border-[#6556CD]/30 backdrop-blur-sm z-50 shadow-2xl">
      <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-3 md:py-4">
        {/* Track Info & Controls */}
        <div className="flex items-center gap-2 md:gap-6 mb-2 md:mb-3">
          {/* Album Art */}
          <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 bg-gradient-to-br from-amber-900/20 to-red-900/30 rounded-lg overflow-hidden border border-[#6556CD]/20">
            {track.album_image ? (
              <img
                src={track.album_image}
                alt={track.album_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaPlay className="text-amber-500 text-xl md:text-2xl" />
              </div>
            )}
          </div>

          {/* Track Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-zinc-200 font-medium truncate text-sm md:text-base">
              {track.name}
            </h3>
            <p className="text-zinc-500 text-xs md:text-sm truncate">
              {track.artist_name}
            </p>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-3">
            {/* Offline Indicator */}
            {isOffline && (
              <div className="flex items-center gap-2 text-orange-500 text-sm">
                <RiWifiOffLine />
                <span>Offline</span>
              </div>
            )}

            {/* Download Progress */}
            {downloadProgress > 0 && downloadProgress < 100 && (
              <div className="flex items-center gap-2 text-blue-500 text-sm">
                <FaDownload />
                <span>{Math.round(downloadProgress)}%</span>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <FaSpinner className="text-zinc-500 animate-spin" />
            )}

            {/* Online Indicator */}
            {!isOffline && !isLoading && (
              <FaWifi className="text-green-500" />
            )}
          </div>

          {/* Mobile Status Indicators */}
          <div className="flex md:hidden items-center gap-2">
            {isLoading && <FaSpinner className="text-amber-500 animate-spin text-sm" />}
            {isOffline && <RiWifiOffLine className="text-orange-500 text-sm" />}
            {!isOffline && !isLoading && <FaWifi className="text-green-500 text-sm" />}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <FaTimes className="text-lg md:text-xl" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm mb-3 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-2 md:mb-3">
          <div
            className="relative h-1.5 md:h-2 bg-[#0d0917] rounded-full cursor-pointer group border border-[#6556CD]/20"
            onClick={handleProgressClick}
          >
            {/* Buffered Ranges */}
            {bufferedRanges.map((range, index) => (
              <div
                key={index}
                className="absolute h-full bg-zinc-700/50 rounded-full"
                style={{
                  left: `${(range.start / duration) * 100}%`,
                  width: `${((range.end - range.start) / duration) * 100}%`
                }}
              />
            ))}

            {/* Progress */}
            <div
              className="absolute h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />

            {/* Hover Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ring-2 ring-amber-500/50"
              style={{ left: `${progressPercentage}%`, marginLeft: '-6px' }}
            />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-[10px] md:text-xs text-zinc-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-zinc-700 disabled:to-zinc-800 disabled:cursor-not-allowed rounded-full text-white transition-all shadow-lg transform hover:scale-105"
          >
            {isLoading ? (
              <FaSpinner className="text-base md:text-lg animate-spin" />
            ) : isPlaying ? (
              <FaPause className="text-base md:text-lg" />
            ) : (
              <FaPlay className="text-base md:text-lg ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <FaVolumeMute className="text-base md:text-xl" />
              ) : (
                <FaVolumeUp className="text-base md:text-xl" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 md:w-24 accent-amber-500"
            />
          </div>

          {/* Buffer Status - Desktop Only */}
          {manifest && (
            <div className="hidden md:block text-xs text-zinc-500">
              <span>Buffer: {bufferedRanges.length > 0 ? 
                `${formatTime(bufferedRanges[bufferedRanges.length - 1]?.end || 0)}` : 
                '0:00'
              }</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
