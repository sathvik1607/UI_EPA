import api from './api'

export const getNotifications = (userId, unreadOnly = false) =>
  api.get(`/notifications/${userId}`, {
    params: unreadOnly ? { unread_only: true } : {},
  }).then(r => r.data)

export const markNotificationRead = (notifId, userId) =>
  api.patch(`/notifications/${notifId}/read`, null, {
    params: { user_id: userId },
  }).then(r => r.data)

export const markAllRead = (userId) =>
  api.post(`/notifications/${userId}/read-all`).then(r => r.data)
