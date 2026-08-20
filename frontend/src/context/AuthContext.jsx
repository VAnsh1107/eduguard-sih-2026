import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_profile')
    return saved ? JSON.parse(saved) : null
  })

  // Sync axios default authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Automatically refresh expired access tokens using the refresh token
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config
        // Avoid infinite loop if refresh itself returns 401
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh')) {
          originalRequest._retry = true
          const rToken = localStorage.getItem('refresh_token')
          if (rToken) {
            try {
              const res = await axios.post('/api/auth/refresh', {}, {
                headers: { 'Authorization': `Bearer ${rToken}` }
              })
              const newAccessToken = res.data.access_token
              localStorage.setItem('access_token', newAccessToken)
              setToken(newAccessToken)
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
              return axios(originalRequest)
            } catch (refreshError) {
              logout()
            }
          } else {
            logout()
          }
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  function login(accessToken, refreshToken, userData) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('user_profile', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }

  function logout() {
    axios.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
