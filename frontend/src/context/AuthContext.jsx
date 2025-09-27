import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADING':
      return {
        ...state,
        loading: true
      }
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        loading: false,
        isAuthenticated: true
      }
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true
      }
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false
      }
    default:
      return state
  }
}

// Set auth token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000'

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from token on app start
  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token)
      loadUser()
    } else {
      dispatch({ type: 'AUTH_ERROR' })
    }
  }, [])

  // Load user
  const loadUser = async () => {
    dispatch({ type: 'USER_LOADING' })
    try {
      const res = await axios.get('/api/auth/me')
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.user
      })
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' })
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password
      })
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      })
      
      setAuthToken(res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      return { success: true }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' })
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: res.data.token,
          user: res.data.user
        }
      })
      
      setAuthToken(res.data.token)
      toast.success(`Welcome, ${res.data.user.name}!`)
      return { success: true }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' })
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    setAuthToken(null)
    toast.success('Logged out successfully')
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}