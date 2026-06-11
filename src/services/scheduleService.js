import api from './api'

export const getMeetings = (userId) =>
  api.get(`/meetings/${userId}`).then(r => r.data.meetings)

export const getTasks = (userId) =>
  api.get(`/tasks/${userId}`).then(r =>
    r.data.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  )

export const getAssignedTasks = (userId) =>
  api.get(`/tasks/assigned/${userId}`).then(r => r.data.tasks)

export const getCompletedTasks = (userId) =>
  api.get(`/tasks/${userId}?status=completed`).then(r => r.data.tasks)

export const getMemberCompletedTasks = (userId) =>
  api.get(`/tasks/assigned/${userId}?status=completed`).then(r => r.data.tasks ?? r.data)

export const cancelItem = (userId, itemId) =>
  api.delete(`/items/${itemId}?user_id=${userId}`).then(r => r.data)

export const completeItem = (userId, itemId) =>
  api.patch(`/items/${itemId}/complete?user_id=${userId}`).then(r => r.data)
