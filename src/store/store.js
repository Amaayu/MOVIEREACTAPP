import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import settingsReducer from './settingsSlice';
import wishlistReducer from './wishlistSlice';
import likesReducer from './likesSlice';
import bookmarksReducer from './bookmarksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    wishlist: wishlistReducer,
    likes: likesReducer,
    bookmarks: bookmarksReducer,
  },
});
