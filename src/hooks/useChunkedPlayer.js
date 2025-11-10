import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// API base URL - in production VITE_API_URL is '/api', in dev it's 'http://localhost:3000'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Simple chunked audio player - downloads packages sequentially and plays
 */
export function useChunkedPlayer(trackId) {
  const [manifest, setManifest] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedRanges, setBufferedRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const audioRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const nextPackageIndexRef = useRef(0);
  const isAppendingRef = useRef(false);
  const manifestRef = useRef(null);

  /**
   * Fetch manifest
   */
  const fetchManifest = useCallback(async () => {
    try {
      console.log(`📋 Fetching manifest for track ${trackId}`);
      console.log(`URL: ${API_BASE}/music/track/${trackId}/manifest`);
      
      const response = await axios.get(`${API_BASE}/music/track/${trackId}/manifest`);
      const fetchedManifest = response.data.manifest;
      
      console.log('📋 Manifest received:', fetchedManifest);
      
      manifestRef.current = fetchedManifest;
      setManifest(fetchedManifest);
      setDuration(fetchedManifest.duration);
      return fetchedManifest;
    } catch (err) {
      console.error('❌ Error fetching manifest:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      throw err;
    }
  }, [trackId]);

  /**
   * Download and append next package
   */
  const downloadAndAppendNextPackage = useCallback(async () => {
    if (!sourceBufferRef.current || !manifestRef.current || !mediaSourceRef.current) {
      console.error('Missing sourceBuffer, manifest, or mediaSource');
      return false;
    }
    if (isAppendingRef.current) {
      console.warn('Already appending');
      return false;
    }
    if (nextPackageIndexRef.current >= manifestRef.current.packageCount) {
      console.log('All packages loaded');
      return false;
    }

    const packageIndex = nextPackageIndexRef.current;
    isAppendingRef.current = true;

    try {
      // Download package
      console.log(`📦 Downloading package ${packageIndex}/${manifestRef.current.packageCount - 1}`);
      console.log(`URL: ${API_BASE}/music/track/${trackId}/package/${packageIndex}`);
      
      const response = await axios.get(
        `${API_BASE}/music/track/${trackId}/package/${packageIndex}`,
        { 
          responseType: 'arraybuffer',
          timeout: 15000
        }
      );

      console.log(`📦 Response status: ${response.status}`);
      console.log(`📦 Response headers:`, response.headers);

      // Wait if buffer is updating
      if (sourceBufferRef.current.updating) {
        console.log('Waiting for buffer to finish updating...');
        await new Promise(resolve => {
          sourceBufferRef.current.addEventListener('updateend', resolve, { once: true });
        });
      }

      // Check if we have data
      if (!response.data || response.data.byteLength === 0) {
        throw new Error('Empty package data');
      }

      console.log(`📦 Package ${packageIndex} size: ${(response.data.byteLength / 1024).toFixed(2)}KB`);

      // Append to buffer
      sourceBufferRef.current.appendBuffer(response.data);

      // Wait for append to complete
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Append timeout'));
        }, 5000);
        
        const onUpdate = () => {
          clearTimeout(timeout);
          if (sourceBufferRef.current) {
            sourceBufferRef.current.removeEventListener('updateend', onUpdate);
            sourceBufferRef.current.removeEventListener('error', onError);
          }
          resolve();
        };
        const onError = (e) => {
          clearTimeout(timeout);
          if (sourceBufferRef.current) {
            sourceBufferRef.current.removeEventListener('updateend', onUpdate);
            sourceBufferRef.current.removeEventListener('error', onError);
          }
          console.error('SourceBuffer error:', e);
          reject(e);
        };
        sourceBufferRef.current.addEventListener('updateend', onUpdate);
        sourceBufferRef.current.addEventListener('error', onError);
      });

      // Update progress
      nextPackageIndexRef.current++;
      const progress = (nextPackageIndexRef.current / manifestRef.current.packageCount) * 100;
      setDownloadProgress(progress);

      console.log(`✅ Package ${packageIndex} appended successfully`);

      // Check if all packages are loaded
      if (nextPackageIndexRef.current >= manifestRef.current.packageCount) {
        console.log('🎉 All packages loaded! Ending stream...');
        // Wait a bit for the last append to complete
        setTimeout(() => {
          if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
            try {
              mediaSourceRef.current.endOfStream();
              console.log('✅ Stream ended successfully');
            } catch (e) {
              console.warn('Could not end stream:', e);
            }
          }
        }, 100);
      }

      return true;
    } catch (err) {
      console.error(`❌ Error with package ${packageIndex}:`, err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // If 404, the package doesn't exist - end the stream
      if (err.response?.status === 404) {
        console.log('📦 Package not found - ending stream with available data');
        setTimeout(() => {
          if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
            try {
              mediaSourceRef.current.endOfStream();
              console.log('✅ Stream ended (partial)');
            } catch (e) {
              console.warn('Could not end stream:', e);
            }
          }
        }, 100);
        // Mark as complete to stop retrying
        nextPackageIndexRef.current = manifestRef.current.packageCount;
      }
      
      return false;
    } finally {
      isAppendingRef.current = false;
    }
  }, [trackId]);

  /**
   * Initialize player
   */
  const initializePlayer = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch manifest
      const trackManifest = await fetchManifest();

      // Check MSE support
      if (!window.MediaSource) {
        throw new Error('MediaSource not supported');
      }

      // Create audio element
      audioRef.current = new Audio();

      // Create MediaSource
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      audioRef.current.src = URL.createObjectURL(mediaSource);

      // Wait for source to open
      await new Promise((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
        mediaSource.addEventListener('error', reject, { once: true });
      });

      // Create source buffer
      sourceBufferRef.current = mediaSource.addSourceBuffer('audio/mpeg');

      console.log('🎵 MediaSource ready, loading initial packages...');

      // Load first 3 packages
      const initialPackages = Math.min(3, trackManifest.packageCount);
      for (let i = 0; i < initialPackages; i++) {
        const success = await downloadAndAppendNextPackage();
        if (!success && i === 0) {
          throw new Error('Failed to load first package');
        }
      }

      // Wait for buffer to be ready
      if (sourceBufferRef.current.updating) {
        await new Promise(resolve => {
          sourceBufferRef.current.addEventListener('updateend', resolve, { once: true });
        });
      }

      console.log(`✅ Loaded ${nextPackageIndexRef.current} packages, buffer ready`);

      // Verify we have buffered data
      if (audioRef.current.buffered.length === 0) {
        throw new Error('No data in buffer after loading packages');
      }

      const bufferedSeconds = audioRef.current.buffered.end(0);
      console.log(`📊 Buffer contains ${bufferedSeconds.toFixed(2)} seconds of audio`);

      // Set up time update
      audioRef.current.addEventListener('timeupdate', () => {
        if (!audioRef.current) return; // Safety check
        
        setCurrentTime(audioRef.current.currentTime);
        
        // Update buffered ranges
        const ranges = [];
        for (let i = 0; i < audioRef.current.buffered.length; i++) {
          ranges.push({
            start: audioRef.current.buffered.start(i),
            end: audioRef.current.buffered.end(i)
          });
        }
        setBufferedRanges(ranges);

        // Load next package when getting close to end of buffer
        if (audioRef.current.buffered.length > 0) {
          const bufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
          const timeUntilEnd = bufferedEnd - audioRef.current.currentTime;
          
          // Load next package when less than 10 seconds buffered ahead
          if (timeUntilEnd < 10 && !isAppendingRef.current) {
            downloadAndAppendNextPackage();
          }
        }
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      // Add waiting/stalled handlers for debugging
      audioRef.current.addEventListener('waiting', () => {
        console.log('⏳ Audio waiting for data...');
      });

      audioRef.current.addEventListener('stalled', () => {
        console.log('⚠️ Audio stalled');
      });

      audioRef.current.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
      });

      console.log('✅ Player initialized');
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message || 'Failed to initialize player');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchManifest, downloadAndAppendNextPackage]);

  /**
   * Play
   */
  const play = useCallback(async () => {
    try {
      setError(null);
      
      if (!audioRef.current) {
        console.log('🎵 Initializing player...');
        await initializePlayer();
      }

      // Wait for buffer to have data (with timeout)
      const maxWait = 5000; // 5 seconds
      const startWait = Date.now();
      
      while ((!audioRef.current.buffered || audioRef.current.buffered.length === 0) && 
             (Date.now() - startWait < maxWait)) {
        console.log('⏳ Waiting for buffer...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Final check
      if (!audioRef.current.buffered || audioRef.current.buffered.length === 0) {
        throw new Error('No audio data buffered after waiting');
      }

      console.log('🎵 Starting playback...');
      console.log(`Buffer: ${audioRef.current.buffered.end(0).toFixed(2)}s`);
      
      await audioRef.current.play();
      setIsPlaying(true);
      console.log('✅ Playing');
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Click play again to start');
        return;
      }
      if (err.name === 'AbortError') {
        console.log('Play aborted');
        return;
      }
      console.error('Play error:', err);
      setError(err.message);
    }
  }, [initializePlayer]);

  /**
   * Pause
   */
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  /**
   * Seek
   */
  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  /**
   * Cleanup on unmount or track change
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
        try {
          mediaSourceRef.current.endOfStream();
        } catch (e) {
          // Ignore
        }
      }
      
      // Reset refs
      nextPackageIndexRef.current = 0;
      isAppendingRef.current = false;
      manifestRef.current = null;
      audioRef.current = null;
      mediaSourceRef.current = null;
      sourceBufferRef.current = null;
      
      // Reset state
      setIsPlaying(false);
      setCurrentTime(0);
      setBufferedRanges([]);
      setDownloadProgress(0);
    };
  }, [trackId]);

  return {
    manifest,
    isPlaying,
    currentTime,
    duration,
    bufferedRanges,
    isLoading,
    error,
    downloadProgress,
    isOffline: false,
    play,
    pause,
    seek,
    setVolume,
    audioRef
  };
}
