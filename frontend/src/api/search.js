import client from './client.js'

export const searchUsers    = (q, page = 0) =>
  client.get('/search/users',    { params: { q, page, size: 20 } })
export const searchPosts    = (q, page = 0) =>
  client.get('/search/posts',    { params: { q, page, size: 20 } })
export const searchHashtags = (q, page = 0) =>
  client.get('/search/hashtags', { params: { q, page, size: 20 } })
