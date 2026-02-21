import api from './api';

export const postService = {
  getFeed: async (page = 0, size = 20) => {
    const response = await api.get(`/feed?page=${page}&size=${size}`);
    return response.data;
  },

  getExplore: async (page = 0, size = 20) => {
    const response = await api.get(`/feed/explore?page=${page}&size=${size}`);
    return response.data;
  },

  getTrending: async (page = 0, size = 20) => {
    const response = await api.get(`/feed/trending?page=${page}&size=${size}`);
    return response.data;
  },

  createPost: async (data) => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  updatePost: async (id, data) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  unlikePost: async (id) => {
    const response = await api.delete(`/posts/${id}/like`);
    return response.data;
  },

  getComments: async (id) => {
    const response = await api.get(`/posts/${id}/comments`);
    return response.data;
  },

  addComment: async (id, data) => {
    const response = await api.post(`/posts/${id}/comments`, data);
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};
