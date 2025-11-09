import { createSlice } from '@reduxjs/toolkit';

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBookmarks: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addBookmark: (state, action) => {
      state.items.unshift(action.payload);
    },
    removeBookmark: (state, action) => {
      const { mediaId, mediaType } = action.payload;
      state.items = state.items.filter(
        item => !(item.mediaId === mediaId && item.mediaType === mediaType)
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearBookmarks: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setBookmarks,
  addBookmark,
  removeBookmark,
  setLoading,
  setError,
  clearBookmarks,
} = bookmarksSlice.actions;

export default bookmarksSlice.reducer;
