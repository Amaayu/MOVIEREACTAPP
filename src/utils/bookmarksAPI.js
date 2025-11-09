import api from './api';

export const bookmarksAPI = {
  // Get all bookmarks
  getBookmarks: () => api.get('/bookmarks'),

  // Add bookmark
  addBookmark: (data) => api.post('/bookmarks', data),

  // Remove bookmark
  removeBookmark: (mediaId, mediaType) => 
    api.delete(`/bookmarks/${mediaId}/${mediaType}`),

  // Check if item is bookmarked
  checkBookmark: (mediaId, mediaType) => 
    api.get(`/bookmarks/check/${mediaId}/${mediaType}`),
};
