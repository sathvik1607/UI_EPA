import api from './api'

export const getMeetings = (userId) =>
  api.get(`/meetings/${userId}`).then(r => r.data.meetings)

export const getTasks = (userId) =>
  api.get(`/tasks/${userId}?status=pending`).then(r => r.data.tasks)

export const cancelItem = (userId, itemId) =>
  api.delete(`/items/${itemId}?user_id=${userId}`).then(r => r.data)

export const completeItem = (userId, itemId) =>
  api.patch(`/items/${itemId}/complete?user_id=${userId}`).then(r => r.data)
