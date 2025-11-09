import api from './api';

export const settingsAPI = {
  // Get user settings
  getSettings: () => api.get('/settings'),

  // Update user settings
  updateSettings: (data) => api.put('/settings', data),
};
