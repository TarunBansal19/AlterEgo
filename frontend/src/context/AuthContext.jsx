/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react'
import { setOnUnauthorized } from '../api/client'
import { getUser, signInWithPassword, signUpWithPassword } from '../api/supabaseAuth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  // On mount: validate the saved Supabase access token.
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        setIsLoading(false)
        return
      }
      try {
        const user = await getUser(savedToken)
        setUser(user)
        setToken(savedToken)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    validateToken()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  // Wire 401 interceptor
  useEffect(() => {
    setOnUnauthorized(() => {
      logout()
    })
  }, [logout])

  const login = async (email, password) => {
    const data = await signInWithPassword(email, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const signup = async (name, email, password) => {
    const data = await signUpWithPassword(name, email, password)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
