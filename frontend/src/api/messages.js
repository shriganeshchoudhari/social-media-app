import client from './client.js'

export const getConversations = () =>
  client.get('/messages/conversations')

export const sendMessage = (recipientId, content) =>
  client.post('/messages', { recipientId, content })

export const getMessages = (conversationId, page = 0, size = 40) =>
  client.get(`/messages/conversations/${conversationId}/messages`, {
    params: { page, size },
  })

export const markRead = (conversationId) =>
  client.put(`/messages/conversations/${conversationId}/read`)
