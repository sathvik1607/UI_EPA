import axios from 'axios'

const [primaryURL, fallbackURL] = (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  .split(',')
  .map((u) => u.trim())

let activeBase = primaryURL

const api = axios.create({
  baseURL: activeBase,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
})

api.interceptors.request.use((config) => {
  config.baseURL = activeBase
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isNetworkError = !err.response
    if (isNetworkError && fallbackURL && activeBase !== fallbackURL) {
      activeBase = fallbackURL
      err.config.baseURL = fallbackURL
      return api.request(err.config)
    }
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
