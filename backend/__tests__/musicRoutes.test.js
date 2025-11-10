const request = require('supertest');
const express = require('express');
const musicRoutes = require('../routes/musicRoutes');

// Mock the jamendo service
jest.mock('../services/jamendoService');
const { searchTracks, getTrackMetadata, streamAudioChunk } = require('../services/jamendoService');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/music', musicRoutes);

describe('Music API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/music/search', () => {
    it('should return search results', async () => {
      const mockTracks = [
        {
          id: '123',
          name: 'Test Song',
          artist_name: 'Test Artist',
          duration: 180,
          stream_url: 'https://example.com/track.mp3',
          packageSize: 262144,
          packageCount: 10
        }
      ];

      searchTracks.mockResolvedValue(mockTracks);

      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test', limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tracks).toEqual(mockTracks);
      expect(response.body.count).toBe(1);
      expect(searchTracks).toHaveBeenCalledWith('test', 20);
    });

    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/music/search');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Search query is required');
    });

    it('should handle search errors', async () => {
      searchTracks.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/music/search')
        .query({ q: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should sanitize and limit query parameters', async () => {
      searchTracks.mockResolvedValue([]);

      await request(app)
        .get('/api/music/search')
        .query({ q: 'test', limit: 100 });

      expect(searchTracks).toHaveBeenCalledWith('test', 50); // Max limit is 50
    });
  });

  describe('GET /api/music/track/:id/manifest', () => {
    it('should return track manifest', async () => {
      const mockManifest = {
        id: '123',
        name: 'Test Song',
        artist_name: 'Test Artist',
        duration: 180,
        stream_url: 'https://example.com/track.mp3',
        album_name: 'Test Album',
        album_image: 'https://example.com/image.jpg',
        packageSize: 262144,
        packageCount: 10
      };

      getTrackMetadata.mockResolvedValue(mockManifest);

      const response = await request(app)
        .get('/api/music/track/123/manifest');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.manifest).toEqual(mockManifest);
      expect(getTrackMetadata).toHaveBeenCalledWith('123');
    });

    it('should return 400 for invalid track ID', async () => {
      const response = await request(app)
        .get('/api/music/track/invalid/manifest');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid track ID');
    });

    it('should handle metadata errors', async () => {
      getTrackMetadata.mockRejectedValue(new Error('Track not found'));

      const response = await request(app)
        .get('/api/music/track/123/manifest');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/music/track/:id/package/:index', () => {
    it('should return audio package', async () => {
      const mockMetadata = {
        id: '123',
        duration: 180,
        packageSize: 262144,
        packageCount: 10,
        stream_url: 'https://example.com/track.mp3'
      };

      const mockChunk = {
        data: Buffer.from('audio data'),
        contentLength: 10,
        contentRange: 'bytes 0-262143/2621440',
        totalSize: 2621440
      };

      getTrackMetadata.mockResolvedValue(mockMetadata);
      streamAudioChunk.mockResolvedValue(mockChunk);

      const response = await request(app)
        .get('/api/music/track/123/package/0');

      expect(response.status).toBe(206);
      expect(response.headers['content-type']).toBe('audio/mpeg');
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(getTrackMetadata).toHaveBeenCalledWith('123');
    });

    it('should return 400 for invalid package index', async () => {
      const response = await request(app)
        .get('/api/music/track/123/package/-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid package index');
    });

    it('should return 404 for out of range package index', async () => {
      const mockMetadata = {
        id: '123',
        packageCount: 10
      };

      getTrackMetadata.mockResolvedValue(mockMetadata);

      const response = await request(app)
        .get('/api/music/track/123/package/20');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Package index out of range');
    });
  });

  describe('GET /api/music/track/:id/stream', () => {
    it('should redirect to stream URL when no range header', async () => {
      const mockMetadata = {
        id: '123',
        stream_url: 'https://example.com/track.mp3'
      };

      getTrackMetadata.mockResolvedValue(mockMetadata);

      const response = await request(app)
        .get('/api/music/track/123/stream');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(mockMetadata.stream_url);
    });

    it('should stream with range header', async () => {
      const mockMetadata = {
        id: '123',
        stream_url: 'https://example.com/track.mp3'
      };

      const mockChunk = {
        data: Buffer.from('audio data'),
        contentLength: 10,
        contentRange: 'bytes 0-1023/2621440'
      };

      getTrackMetadata.mockResolvedValue(mockMetadata);
      streamAudioChunk.mockResolvedValue(mockChunk);

      const response = await request(app)
        .get('/api/music/track/123/stream')
        .set('Range', 'bytes=0-1023');

      expect(response.status).toBe(206);
      expect(response.headers['content-type']).toBe('audio/mpeg');
    });
  });
});
