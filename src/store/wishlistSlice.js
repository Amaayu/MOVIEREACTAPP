import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    addToWishlist: (state, action) => {
      state.items.unshift(action.payload);
    },
    removeFromWishlist: (state, action) => {
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
    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  setLoading,
  setError,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
