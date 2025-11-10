# Movie-Hub Music Feature - Quick Start Guide

Get the music streaming feature running in under 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB running (local or cloud)
- Jamendo API key ([Get free key](https://devportal.jamendo.com/))

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=3000
JAMENDO_CLIENT_ID=your_jamendo_client_id
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3000
# In production, this can be empty - API will be on same domain at /api/*
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access the App

Open your browser to: `http://localhost:5173`

1. Login/Register
2. Click "Music" in the sidebar
3. Search for songs (try "rock", "jazz", "electronic")
4. Click a track to start streaming!

## 🎵 Testing the Features

### Test Chunked Streaming
1. Search for a song
2. Click to play
3. Open DevTools → Network tab
4. Watch multiple package requests load concurrently

### Test Offline Mode
1. Play a song and let it buffer
2. Open DevTools → Network tab → Set to "Offline"
3. Playback continues from cache!
4. Go back online - prefetching resumes

### Test Cache
1. Play a song completely
2. Go offline
3. Search and play the same song
4. It plays entirely from cache!

## 🧪 Run Tests

```bash
cd backend
npm test
```

## 📊 Monitor Performance

### Check Cache Size
Open browser console:
```javascript
import { getCacheStats } from './utils/audioDatabase';
const stats = await getCacheStats();
console.log(stats);
```

### View Queue Status
```javascript
import packageQueue from './utils/packageQueue';
console.log(packageQueue.getStatus());
```

## 🐛 Troubleshooting

### "Failed to search tracks"
- Check Jamendo API key in `backend/.env`
- Verify backend is running on port 3000
- Check network connectivity

### "MediaSource not supported"
- Use Chrome 23+, Firefox 42+, or Safari 8+
- Enable JavaScript

### Playback stuttering
- Check network speed
- Increase `PREFETCH_COUNT` in `useChunkedPlayer.js`
- Clear browser cache

### Backend not starting
- Check MongoDB connection string
- Ensure port 3000 is available
- Run `npm install` in backend directory

## 🎯 Key Configuration

### Adjust Chunk Size
`src/hooks/useChunkedPlayer.js`:
```javascript
const PACKAGE_SIZE = 256 * 1024;  // 256KB (default)
```

### Adjust Prefetch
```javascript
const PREFETCH_COUNT = 6;  // Prefetch 6 chunks ahead
```

### Adjust Cache Limit
`src/utils/audioDatabase.js`:
```javascript
const MAX_CACHE_SIZE = 100 * 1024 * 1024;  // 100MB
```

## 📚 Next Steps

- Read full documentation: `MUSIC_README.md`
- Explore API endpoints: `backend/routes/musicRoutes.js`
- Customize UI: `src/components/Music*.jsx`
- Add features: playlists, favorites, etc.

## 🆘 Need Help?

- Check `MUSIC_README.md` for detailed docs
- Review test files for usage examples
- Open an issue on GitHub

---

**Happy Streaming! 🎵**
