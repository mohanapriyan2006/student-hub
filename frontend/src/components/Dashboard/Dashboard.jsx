import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()

  useEffect(() => {
    // This component will redirect based on user role
  }, [user])

  // Redirect based on user role
  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />
  } else if (user?.role === 'faculty') {
    return <Navigate to="/faculty/dashboard" replace />
  } else if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Fallback for any other case
  return <Navigate to="/login" replace />
}

export default Dashboard