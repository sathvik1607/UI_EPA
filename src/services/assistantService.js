import api from './api'

export const sendMessage = (message, userId) =>
  api.post('/chat', { message, user_id: userId }).then((r) => r.data)
