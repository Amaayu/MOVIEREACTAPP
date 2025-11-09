import api from './api';

export const likesAPI = {
  // Get all liked items
  getLikes: () => api.get('/likes'),

  // Add like
  addLike: (data) => api.post('/likes', data),

  // Remove like
  removeLike: (mediaId, mediaType) => 
    api.delete(`/likes/${mediaId}/${mediaType}`),

  // Check if item is liked
  checkLike: (mediaId, mediaType) => 
    api.get(`/likes/check/${mediaId}/${mediaType}`),
};
