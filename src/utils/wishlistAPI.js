import api from './api';

export const wishlistAPI = {
  // Get all wishlist items
  getWishlist: () => api.get('/wishlist'),

  // Add item to wishlist
  addToWishlist: (data) => api.post('/wishlist', data),

  // Remove item from wishlist
  removeFromWishlist: (mediaId, mediaType) => 
    api.delete(`/wishlist/${mediaId}/${mediaType}`),

  // Check if item is in wishlist
  checkWishlist: (mediaId, mediaType) => 
    api.get(`/wishlist/check/${mediaId}/${mediaType}`),
};
