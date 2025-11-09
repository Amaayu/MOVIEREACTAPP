require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const User = require('./models/User');
const Wishlist = require('./models/Wishlist');
const Like = require('./models/Like');
const Bookmark = require('./models/Bookmark');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.vercel.app'] // Update with your Vercel domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============ AUTH ROUTES ============

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create default settings for user
    await Settings.create({ userId: user._id });

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile endpoint (protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile endpoint (protected)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar, bio },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ WISHLIST ROUTES ============

// Get user's wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to wishlist
app.post('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath, overview, releaseDate, voteAverage, priority } = req.body;

    const wishlistItem = await Wishlist.create({
      userId: req.user.id,
      mediaId,
      mediaType,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
      priority: priority || 'medium',
    });

    res.status(201).json({ wishlistItem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from wishlist
app.delete('/api/wishlist/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    await Wishlist.findOneAndDelete({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is in wishlist
app.get('/api/wishlist/check/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    const item = await Wishlist.findOne({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ LIKES ROUTES ============

// Get user's likes
app.get('/api/likes', authenticateToken, async (req, res) => {
  try {
    const likes = await Like.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ likes });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add like
app.post('/api/likes', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath, overview, releaseDate, voteAverage } = req.body;

    const like = await Like.create({
      userId: req.user.id,
      mediaId,
      mediaType,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
    });

    res.status(201).json({ like });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already liked' });
    }
    console.error('Add like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove like
app.delete('/api/likes/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    await Like.findOneAndDelete({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ message: 'Like removed' });
  } catch (error) {
    console.error('Remove like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is liked
app.get('/api/likes/check/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    const item = await Like.findOne({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ isLiked: !!item });
  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ BOOKMARKS ROUTES ============

// Get user's bookmarks
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType, title, posterPath, overview, releaseDate, voteAverage } = req.body;

    const bookmark = await Bookmark.create({
      userId: req.user.id,
      mediaId,
      mediaType,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
    });

    res.status(201).json({ bookmark });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }
    console.error('Add bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove bookmark
app.delete('/api/bookmarks/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    await Bookmark.findOneAndDelete({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if item is bookmarked
app.get('/api/bookmarks/check/:mediaId/:mediaType', authenticateToken, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    const item = await Bookmark.findOne({
      userId: req.user.id,
      mediaId: parseInt(mediaId),
      mediaType,
    });

    res.json({ isBookmarked: !!item });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ SETTINGS ROUTES ============

// Get user settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ userId: req.user.id });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );

    res.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export for Vercel serverless
module.exports = app;

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
