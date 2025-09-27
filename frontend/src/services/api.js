import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  }
}

// Activities API
export const activitiesAPI = {
  submitActivity: async (activityData) => {
    const formData = new FormData()
    
    // Append all activity data to FormData
    Object.keys(activityData).forEach(key => {
      if (key === 'evidence_file' && activityData[key]) {
        formData.append('evidence_file', activityData[key])
      } else if (key === 'skills') {
        formData.append('skills', JSON.stringify(activityData[key]))
      } else if (activityData[key] !== null && activityData[key] !== undefined) {
        formData.append(key, activityData[key])
      }
    })

    const response = await api.post('/activities/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  getMyActivities: async (filters = {}) => {
    const params = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key])
      }
    })
    
    const response = await api.get(`/activities/my-activities?${params.toString()}`)
    return response.data
  },

  getMyStats: async () => {
    const response = await api.get('/activities/my-stats')
    return response.data
  },

  getActivity: async (id) => {
    const response = await api.get(`/activities/${id}`)
    return response.data
  },

  updateActivity: async (id, activityData) => {
    const formData = new FormData()
    
    Object.keys(activityData).forEach(key => {
      if (key === 'evidence_file' && activityData[key]) {
        formData.append('evidence_file', activityData[key])
      } else if (key === 'skills') {
        formData.append('skills', JSON.stringify(activityData[key]))
      } else if (activityData[key] !== null && activityData[key] !== undefined) {
        formData.append(key, activityData[key])
      }
    })

    const response = await api.put(`/activities/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/activities/${id}`)
    return response.data
  }
}

// Faculty API
export const facultyAPI = {
  getPendingActivities: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/faculty/pending-activities?${queryParams.toString()}`)
    return response.data
  },

  reviewActivity: async (id, reviewData) => {
    const response = await api.post(`/faculty/review/${id}`, reviewData)
    return response.data
  },

  getMyReviews: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/faculty/my-reviews?${queryParams.toString()}`)
    return response.data
  },

  getFacultyStats: async () => {
    const response = await api.get('/faculty/stats')
    return response.data
  },

  getStudentActivities: async (studentId, params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/faculty/student-activities/${studentId}?${queryParams.toString()}`)
    return response.data
  },

  updateReviewFeedback: async (id, feedback) => {
    const response = await api.put(`/faculty/review/${id}`, { feedback })
    return response.data
  }
}

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/admin/users?${queryParams.toString()}`)
    return response.data
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`)
    return response.data
  },

  getActivities: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/admin/activities?${queryParams.toString()}`)
    return response.data
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/admin/activities/${id}`)
    return response.data
  },

  exportActivities: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key])
      }
    })
    
    const response = await api.get(`/admin/export/activities?${queryParams.toString()}`, {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'activities_export.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { message: 'Export downloaded successfully' }
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData)
    return response.data
  }
}

// File utilities
export const fileUtils = {
  getFileUrl: (filename) => {
    if (!filename) return null
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return `${baseURL}/files/${filename.replace('/api/files/', '')}`
  },

  downloadFile: async (filename) => {
    const url = fileUtils.getFileUrl(filename)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    link.setAttribute('target', '_blank')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
}

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('API is not available')
  }
}

// Export default api instance for custom requests
export default api