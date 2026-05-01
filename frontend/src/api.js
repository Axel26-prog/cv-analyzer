import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({ baseURL: API_URL })

// Agrega el token automáticamente a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const register = (email, password) =>
  api.post('/auth/register', { email, password })

export const login = async (email, password) => {
  const form = new FormData()
  form.append('username', email)
  form.append('password', password)
  const res = await api.post('/auth/login', form)
  localStorage.setItem('token', res.data.access_token)
  return res.data
}

export const logout = () => localStorage.removeItem('token')

export const analyzeCV = (file, jobDescription) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('job_description', jobDescription)
  return api.post('/cv/analyze', formData)
}

export const getHistory = () => api.get('/cv/history')