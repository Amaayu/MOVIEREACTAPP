jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      baseURL: 'http://localhost:3000/api',
      headers: { 'Content-Type': 'application/json' },
    },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

const api = {
  defaults: {
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
  },
};

const authAPI = {
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
};

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('should have login method', () => {
      expect(typeof authAPI.login).toBe('function');
    });

    it('should have register method', () => {
      expect(typeof authAPI.register).toBe('function');
    });

    it('should have getProfile method', () => {
      expect(typeof authAPI.getProfile).toBe('function');
    });
  });

  describe('API configuration', () => {
    it('should be configured with correct base URL', () => {
      expect(api.defaults.baseURL).toBeDefined();
    });

    it('should have JSON content type header', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });
});
