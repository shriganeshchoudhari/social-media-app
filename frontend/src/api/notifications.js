import client from './client.js'

export const getNotifications     = (page = 0, { unreadOnly = false, type = null } = {}) =>
  client.get('/notifications', { params: { page, size: 20, unreadOnly, ...(type && { type }) } })

export const getUnreadCount       = () => client.get('/notifications/unread-count')
export const markAllRead          = () => client.patch('/notifications/read-all')
export const markRead             = (id) => client.patch(`/notifications/${id}/read`)
export const deleteNotification   = (id) => client.delete(`/notifications/${id}`)
export const clearAllNotifications = () => client.delete('/notifications')
