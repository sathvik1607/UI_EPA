import api from './api'

export const registerUser = (name, email, password) =>
  api.post('/users', { name, email, password }).then(r => r.data)

export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data)

export const checkHealth = () =>
  api.get('/health').then(r => r.data)

export const registerOwner = (name, companyName, password) =>
  api.post('/auth/register/owner', { name, company_name: companyName, password }).then(r => r.data)

export const registerMember = (name, teamId, password) =>
  api.post('/auth/register/member', { name, team_id: teamId, password }).then(r => r.data)

export const getTeams = () =>
  api.get('/teams').then(r => r.data)

export const getTeamMembers = (teamId) =>
  api.get(`/teams/${teamId}/members`).then(r => r.data)
