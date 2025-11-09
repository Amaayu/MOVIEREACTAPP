import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
} from '../store/authSlice';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('login actions', () => {
    it('should handle loginStart', () => {
      const state = authReducer(initialState, loginStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const payload = {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'test-token',
      };
      const state = authReducer(initialState, loginSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);
      expect(state.error).toBe(null);
      // localStorage is called inside the reducer
    });

    it('should handle loginFailure', () => {
      const error = 'Invalid credentials';
      const state = authReducer(initialState, loginFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('logout action', () => {
    it('should handle logout', () => {
      const authenticatedState = {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      const state = authReducer(authenticatedState, logout());

      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      // localStorage is called inside the reducer
    });
  });

  describe('register actions', () => {
    it('should handle registerStart', () => {
      const state = authReducer(initialState, registerStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle registerSuccess', () => {
      const payload = {
        user: { id: '1', name: 'New User', email: 'new@example.com' },
        token: 'new-token',
      };
      const state = authReducer(initialState, registerSuccess(payload));

      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe(payload.token);
      // localStorage is called inside the reducer
    });

    it('should handle registerFailure', () => {
      const error = 'User already exists';
      const state = authReducer(initialState, registerFailure(error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
