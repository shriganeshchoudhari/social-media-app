import client from './client.js'

export const getNotifications = (page = 0) =>
  client.get('/notifications', { params: { page, size: 20 } })
export const getUnreadCount   = () => client.get('/notifications/unread-count')
export const markAllRead      = () => client.patch('/notifications/read-all')
export const markRead         = (id) => client.patch(`/notifications/${id}/read`)
