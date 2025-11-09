import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      newReleases: true,
      recommendations: true,
    },
    privacy: {
      profileVisibility: 'public',
      showWatchHistory: true,
    },
    preferences: {
      autoplay: true,
      adultContent: false,
      defaultMediaType: 'all',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setSettings: (state, action) => {
      return { ...state, ...action.payload, loading: false };
    },
    updateSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetSettings: () => {
      return {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          newReleases: true,
          recommendations: true,
        },
        privacy: {
          profileVisibility: 'public',
          showWatchHistory: true,
        },
        preferences: {
          autoplay: true,
          adultContent: false,
          defaultMediaType: 'all',
        },
        loading: false,
        error: null,
      };
    },
  },
});

export const {
  setSettings,
  updateSettings,
  setLoading,
  setError,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
