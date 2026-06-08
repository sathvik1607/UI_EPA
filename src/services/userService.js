import api from './api'

export const registerUser = (name, email, password) =>
  api.post('/users', { name, email, password }).then(r => r.data)

export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data)

export const checkHealth = () =>
  api.get('/health').then(r => r.data)
