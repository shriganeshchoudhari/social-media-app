import api from './api';

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getUserByUsername: async (username) => {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  },

  getUserPosts: async (id, page = 0, size = 20) => {
    const response = await api.get(`/users/${id}/posts?page=${page}&size=${size}`);
    return response.data;
  },

  followUser: async (id) => {
    const response = await api.post(`/users/${id}/follow`);
    return response.data;
  },

  unfollowUser: async (id) => {
    const response = await api.delete(`/users/${id}/follow`);
    return response.data;
  },

  getFollowers: async (id) => {
    const response = await api.get(`/users/${id}/followers`);
    return response.data;
  },

  getFollowing: async (id) => {
    const response = await api.get(`/users/${id}/following`);
    return response.data;
  },

  searchUsers: async (q, page = 0, size = 20) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
    return response.data;
  },
};
