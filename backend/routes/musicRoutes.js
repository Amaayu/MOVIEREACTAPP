const express = require('express');
const router = express.Router();
const { searchTracks, getTrackMetadata, streamAudioChunk } = require('../services/jamendoService');
const { searchLimiter, packageLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
const ListeningHistory = require('../models/ListeningHistory');

// Concurrent request queue per track
const trackQueues = new Map();
const MAX_CONCURRENT_PER_TRACK = 6;

/**
 * GET /api/music/search
 * Search for tracks
 */
router.get('/search', searchLimiter, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Sanitize input
    const sanitizedQuery = q.trim().substring(0, 100);
    const sanitizedLimit = Math.min(parseInt(limit) || 20, 50);

    const tracks = await searchTracks(sanitizedQuery, sanitizedLimit);
    
    res.json({
      success: true,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Failed to search tracks' });
  }
});

/**
 * GET /api/music/track/:id/manifest
 * Get track metadata and manifest
 */
router.get('/track/:id/manifest', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid track ID' });
    }

    const metadata = await getTrackMetadata(id);
    
    res.json({
      success: true,
      manifest: {
        id: metadata.id,
        name: metadata.name,
        artist_name: metadata.artist_name,
        duration: metadata.duration,
        album_name: metadata.album_name,
        album_image: metadata.album_image,
        packageSize: metadata.packageSize,
        packageCount: metadata.packageCount,
        stream_url: metadata.stream_url
      }
    });
  } catch (error) {
    console.error('Manifest error:', error);
    res.status(500).json({ error: error.message || 'Failed to get track manifest' });
  }
});

/**
 * GET /api/music/track/:id/package/:index
 * Get a specific package/chunk of audio
 */
router.get('/track/:id/package/:index', packageLimiter, async (req, res) => {
  try {
    const { id, index } = req.params;

    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid track ID' });
    }

    const packageIndex = parseInt(index);
    if (isNaN(packageIndex) || packageIndex < 0) {
      return res.status(400).json({ error: 'Invalid package index' });
    }

    // Get track metadata
    const metadata = await getTrackMetadata(id);
    
    if (packageIndex >= metadata.packageCount) {
      return res.status(404).json({ error: 'Package index out of range' });
    }

    // Calculate byte range
    const packageSize = metadata.packageSize;
    const start = packageIndex * packageSize;
    const end = Math.min(start + packageSize - 1, (metadata.duration * 128 * 1000) / 8);

    // Queue management for concurrent requests
    if (!trackQueues.has(id)) {
      trackQueues.set(id, { active: 0, queue: [] });
    }

    const queue = trackQueues.get(id);

    // Wait if too many concurrent requests for this track
    if (queue.active >= MAX_CONCURRENT_PER_TRACK) {
      await new Promise(resolve => queue.queue.push(resolve));
    }

    queue.active++;

    try {
      // Stream the chunk
      const chunk = await streamAudioChunk(metadata.stream_url, start, end);

      // Set headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', chunk.contentLength);
      res.setHeader('Content-Range', chunk.contentRange);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.status(206); // Partial Content

      res.send(chunk.data);
    } finally {
      queue.active--;
      
      // Process next in queue
      if (queue.queue.length > 0) {
        const next = queue.queue.shift();
        next();
      }

      // Clean up empty queues
      if (queue.active === 0 && queue.queue.length === 0) {
        trackQueues.delete(id);
      }
    }
  } catch (error) {
    console.error('Package error:', error);
    res.status(500).json({ error: error.message || 'Failed to get audio package' });
  }
});

/**
 * GET /api/music/track/:id/stream
 * Stream full track with Range support (fallback)
 */
router.get('/track/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    const range = req.headers.range;

    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid track ID' });
    }

    const metadata = await getTrackMetadata(id);

    if (!range) {
      // No range, redirect to full stream
      return res.redirect(metadata.stream_url);
    }

    // Parse range header
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : undefined;

    const chunk = await streamAudioChunk(metadata.stream_url, start, end || start + 1024 * 1024);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', chunk.contentLength);
    res.setHeader('Content-Range', chunk.contentRange);
    res.setHeader('Accept-Ranges', 'bytes');
    res.status(206);

    res.send(chunk.data);
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: error.message || 'Failed to stream track' });
  }
});

/**
 * POST /api/music/history
 * Track listening history (requires authentication)
 */
router.post('/history', protect, async (req, res) => {
  try {
    const { trackId, trackName, artistName, albumName, albumImage, duration, playDuration, completed, skipped } = req.body;

    if (!trackId || !trackName || !artistName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const history = await ListeningHistory.create({
      userId: req.user._id,
      trackId,
      trackName,
      artistName,
      albumName,
      albumImage,
      duration,
      playDuration: playDuration || 0,
      completed: completed || false,
      skipped: skipped || false
    });

    res.status(201).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('History tracking error:', error);
    res.status(500).json({ error: 'Failed to track listening history' });
  }
});

/**
 * GET /api/music/recommendations
 * Get personalized recommendations based on listening history (requires authentication)
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    // Get user's favorite artists
    const favoriteArtists = await ListeningHistory.getFavoriteArtists(userId, 5);

    if (favoriteArtists.length === 0) {
      // No history, return popular tracks
      const popularTracks = await searchTracks('popular', limit);
      return res.json({
        success: true,
        recommendations: popularTracks,
        reason: 'popular'
      });
    }

    // Search for tracks from favorite artists
    const recommendations = [];
    const seenTrackIds = new Set();

    for (const artist of favoriteArtists) {
      const tracks = await searchTracks(artist.artistName, 5);
      
      for (const track of tracks) {
        if (!seenTrackIds.has(track.id) && recommendations.length < limit) {
          seenTrackIds.add(track.id);
          recommendations.push({
            ...track,
            recommendationReason: `Based on your listening to ${artist.artistName}`
          });
        }
      }

      if (recommendations.length >= limit) break;
    }

    // Fill remaining with similar genre tracks if needed
    if (recommendations.length < limit) {
      const genres = ['pop', 'rock', 'electronic', 'jazz'];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const genreTracks = await searchTracks(randomGenre, limit - recommendations.length);
      
      for (const track of genreTracks) {
        if (!seenTrackIds.has(track.id)) {
          recommendations.push({
            ...track,
            recommendationReason: 'Discover new music'
          });
        }
      }
    }

    res.json({
      success: true,
      recommendations: recommendations.slice(0, limit),
      reason: 'personalized',
      basedOn: favoriteArtists.map(a => a.artistName)
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * GET /api/music/history/recent
 * Get recently played tracks (requires authentication)
 */
router.get('/history/recent', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const recentTracks = await ListeningHistory.getRecentlyPlayed(req.user._id, limit);

    res.json({
      success: true,
      tracks: recentTracks
    });
  } catch (error) {
    console.error('Recent history error:', error);
    res.status(500).json({ error: 'Failed to get recent tracks' });
  }
});

/**
 * GET /api/music/stats
 * Get user's listening statistics (requires authentication)
 */
router.get('/stats', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const stats = await ListeningHistory.getUserStats(req.user._id);
    const favoriteArtists = await ListeningHistory.getFavoriteArtists(req.user._id, 10);

    res.json({
      success: true,
      stats,
      favoriteArtists
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
