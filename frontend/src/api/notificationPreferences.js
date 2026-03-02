import client from './client.js'

export const getPreferences   = ()                  => client.get('/notifications/preferences')
export const updatePreference = (type, inApp)       => client.put(`/notifications/preferences/${type}`, { inApp })
