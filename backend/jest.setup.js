// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';

// Suppress console.error in tests (optional)
// global.console.error = jest.fn();

// Mock Settings model to avoid database calls
jest.mock('./models/Settings', () => ({
  create: jest.fn().mockResolvedValue({ userId: 'test-user-id' }),
}));
