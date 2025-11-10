const request = require('supertest');
const express = require('express');
const authRoutes = require('../authRoutes');
const User = require('../../models/User');
const { sendVerificationEmail } = require('../../services/emailService');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Settings');
jest.mock('../../services/emailService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        isEmailVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('token'); // No token until verified
      expect(sendVerificationEmail).toHaveBeenCalled();
    });

    it('should return error if user already exists', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return error if fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All fields are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login verified user successfully', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      User.findOne.mockResolvedValue({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject login for unverified email', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      User.findOne.mockResolvedValue({
        _id: '123',
        email: 'test@example.com',
        password: 'hashedpassword',
        isEmailVerified: false,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('verify your email');
      expect(response.body.emailNotVerified).toBe(true);
    });

    it('should return error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should verify email with valid token', async () => {
      const mockUser = {
        _id: '123',
        isEmailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 3600000),
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify-email/valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Email verified successfully');
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return error for invalid token', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired verification token');
    });

    it('should return error for expired token', async () => {
      User.findOne.mockResolvedValue(null); // Expired tokens won't be found

      const response = await request(app)
        .get('/api/auth/verify-email/expired-token');

      expect(response.status).toBe(400);
    });
  });
});
