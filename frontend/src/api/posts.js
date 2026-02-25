import client from './client.js'

export const getFeed      = (page = 0, size = 20) =>
  client.get('/posts/feed', { params: { page, size } })
export const getPost      = (id)  => client.get(`/posts/${id}`)
export const createPost   = (data) => client.post('/posts', data)
export const deletePost   = (id)  => client.delete(`/posts/${id}`)
export const updatePost   = (id, data) => client.put(`/posts/${id}`, data)
export const likePost     = (id)  => client.post(`/posts/${id}/like`)
export const unlikePost   = (id)  => client.delete(`/posts/${id}/like`)

export const getComments  = (postId, page = 0) =>
  client.get(`/posts/${postId}/comments`, { params: { page, size: 20 } })
export const addComment   = (postId, data) => client.post(`/posts/${postId}/comments`, data)
export const deleteComment = (postId, commentId) =>
  client.delete(`/posts/${postId}/comments/${commentId}`)
