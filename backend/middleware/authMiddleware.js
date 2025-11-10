const jwt = require('jsonwebtoken');

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Add user from payload
      req.user = { _id: decoded.id, email: decoded.email };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

/**
 * Optional auth - adds user if token exists, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = { _id: decoded.id, email: decoded.email };
    } catch (error) {
      // Token invalid, but continue without user
      console.log('Optional auth: Invalid token, continuing without user');
    }
  }

  next();
};

// Alias for compatibility
const authenticateToken = protect;

module.exports = { protect, optionalAuth, authenticateToken };
