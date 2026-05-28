import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${apiBaseUrl.replace(/\/$/, '')}/api`,
})

// Request interceptor — attach Authorization header
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 for session expiry
// The actual logout + redirect is wired in AuthContext after it sets up
let onUnauthorized = null

export function setOnUnauthorized(callback) {
  onUnauthorized = callback
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default client
