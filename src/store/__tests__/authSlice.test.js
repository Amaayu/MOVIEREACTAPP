import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
} from '../authSlice';

describe('authSlice', () => {
  let initialState;

  beforeEach(() => {
    localStorage.clear();
    initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  });

  describe('login actions', () => {
    it('should handle loginStart', () => {
      const state = authReducer(initialState, loginStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const payload = {
        token: 'fake-token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      };
      const state = authReducer(initialState, loginSuccess(payload));
      
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);
      expect(state.error).toBe(null);
    });

    it('should handle loginFailure', () => {
      const error = 'Invalid credentials';
      const state = authReducer(initialState, loginFailure(error));
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('register actions', () => {
    it('should handle registerStart', () => {
      const state = authReducer(initialState, registerStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle registerSuccess without authentication', () => {
      const payload = {
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
        message: 'Registration successful',
      };
      const state = authReducer(initialState, registerSuccess(payload));
      
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false); // Should not authenticate until email verified
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.error).toBe(null);
    });

    it('should handle registerFailure', () => {
      const error = 'User already exists';
      const state = authReducer(initialState, registerFailure(error));
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('logout action', () => {
    it('should handle logout', () => {
      const authenticatedState = {
        user: { id: '123', name: 'Test User' },
        token: 'fake-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };
      
      const state = authReducer(authenticatedState, logout());
      
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('localStorage integration', () => {
    it('should save token and user to localStorage on loginSuccess', () => {
      const payload = {
        token: 'fake-token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
      };
      
      authReducer(initialState, loginSuccess(payload));
      
      expect(localStorage.getItem('token')).toBe(payload.token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(payload.user));
    });

    it('should remove token and user from localStorage on logout', () => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));
      
      authReducer(initialState, logout());
      
      expect(localStorage.getItem('token')).toBe(null);
      expect(localStorage.getItem('user')).toBe(null);
    });
  });
});
