const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

/**
 * Search tracks on Jamendo
 * @param {string} query - Search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of tracks
 */
async function searchTracks(query, limit = 20) {
  const cacheKey = `search:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: CLIENT_ID,
        format: 'json',
        limit,
        search: query,
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });

    const tracks = response.data.results.map(track => ({
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      duration: track.duration,
      stream_url: track.audio,
      album_name: track.album_name,
      album_image: track.album_image,
      // Calculate package count (256KB packages)
      packageSize: 256 * 1024, // 256KB
      packageCount: Math.ceil((track.duration * 128 * 1000) / (8 * 256 * 1024)) // Estimate for 128kbps MP3
    }));

    cache.set(cacheKey, tracks);
    return tracks;
  } catch (error) {
    console.error('Jamendo search error:', error.message);
    throw new Error('Failed to search tracks');
  }
}

/**
 * Get track metadata
 * @param {string} trackId - Track ID
 * @returns {Promise<Object>} - Track metadata
 */
async function getTrackMetadata(trackId) {
  const cacheKey = `track:${trackId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${JAMENDO_API_BASE}/tracks`, {
      params: {
        client_id: CLIENT_ID,
        format: 'json',
        id: trackId,
        audioformat: 'mp32'
      }
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('Track not found');
    }

    const track = response.data.results[0];
    const packageSize = 256 * 1024; // 256KB
    
    // Get actual file size with HEAD request
    let actualFileSize = null;
    let packageCount = Math.ceil((track.duration * 128 * 1000) / (8 * packageSize)); // Default estimate
    
    try {
      const headResponse = await axios.head(track.audio);
      const contentLength = headResponse.headers['content-length'];
      
      if (contentLength) {
        actualFileSize = parseInt(contentLength);
        // Calculate actual package count based on real file size
        packageCount = Math.ceil(actualFileSize / packageSize);
        console.log(`Track ${trackId}: Actual size ${actualFileSize} bytes, ${packageCount} packages`);
      }
    } catch (headError) {
      console.warn(`Could not get file size for track ${trackId}, using estimate`);
    }
    
    const metadata = {
      id: track.id,
      name: track.name,
      artist_name: track.artist_name,
      duration: track.duration,
      stream_url: track.audio,
      album_name: track.album_name,
      album_image: track.album_image,
      packageSize: packageSize,
      packageCount: packageCount,
      fileSize: actualFileSize
    };

    cache.set(cacheKey, metadata);
    return metadata;
  } catch (error) {
    console.error('Jamendo metadata error:', error.message);
    throw new Error('Failed to get track metadata');
  }
}

/**
 * Stream audio chunk from Jamendo
 * @param {string} streamUrl - Stream URL
 * @param {number} start - Start byte
 * @param {number} end - End byte
 * @returns {Promise<Object>} - { data: Buffer, contentLength: number, contentRange: string }
 */
async function streamAudioChunk(streamUrl, start, end) {
  try {
    const response = await axios.get(streamUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Range': `bytes=${start}-${end}`
      },
      validateStatus: (status) => status === 206 || status === 200
    });

    const contentLength = parseInt(response.headers['content-length'] || '0');
    const contentRange = response.headers['content-range'] || `bytes ${start}-${end}/*`;

    return {
      data: Buffer.from(response.data),
      contentLength,
      contentRange,
      totalSize: response.headers['content-length']
    };
  } catch (error) {
    console.error('Stream chunk error:', error.message);
    throw new Error('Failed to stream audio chunk');
  }
}

module.exports = {
  searchTracks,
  getTrackMetadata,
  streamAudioChunk
};
