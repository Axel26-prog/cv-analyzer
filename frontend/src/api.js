import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({ baseURL: API_URL })

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

export const analyzeCVStream = async function * (file, jobDescription, token) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('job_description', jobDescription)

  const response = await fetch(`${API_URL}/cv/analyze/stream`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        yield data
      }
    }
  }
}

export const getHistory = () => api.get('/cv/history')
