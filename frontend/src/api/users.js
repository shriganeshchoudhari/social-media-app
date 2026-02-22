import client from './client.js'

export const getMe          = ()           => client.get('/users/me')
export const getUser        = (username)   => client.get(`/users/${username}`)
export const updateProfile  = (data)       => client.put('/users/me', data)
export const getUserPosts   = (username, page = 0, size = 20) =>
  client.get(`/users/${username}/posts`, { params: { page, size } })
export const followUser     = (username)   => client.post(`/users/${username}/follow`)
export const unfollowUser   = (username)   => client.delete(`/users/${username}/follow`)
export const isFollowing    = (username)   => client.get(`/users/${username}/is-following`)
export const getFollowers   = (username, page = 0) =>
  client.get(`/users/${username}/followers`, { params: { page, size: 20 } })
export const getFollowing   = (username, page = 0) =>
  client.get(`/users/${username}/following`, { params: { page, size: 20 } })
