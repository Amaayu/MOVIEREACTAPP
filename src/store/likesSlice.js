import { createSlice } from '@reduxjs/toolkit';

const likesSlice = createSlice({
  name: 'likes',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLikes: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addLike: (state, action) => {
      state.items.unshift(action.payload);
    },
    removeLike: (state, action) => {
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
    clearLikes: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setLikes,
  addLike,
  removeLike,
  setLoading,
  setError,
  clearLikes,
} = likesSlice.actions;

export default likesSlice.reducer;
