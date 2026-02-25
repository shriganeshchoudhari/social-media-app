import client from './client.js'

export const toggleBookmark  = (postId) => client.post(`/posts/${postId}/bookmark`)
export const getMyBookmarks  = (page = 0, size = 20) =>
  client.get('/users/me/bookmarks', { params: { page, size } })
