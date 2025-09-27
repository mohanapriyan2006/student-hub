import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Components
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import StudentDashboard from './components/Student/StudentDashboard'
import FacultyDashboard from './components/Faculty/FacultyDashboard'
import AdminDashboard from './components/Admin/AdminDashboard'
import ActivitySubmission from './components/Student/ActivitySubmission'
import Profile from './components/Student/Profile'
import Transcript from './components/Student/Transcript'
import VerificationPortal from './components/Faculty/VerificationPortal'
import AdminAnalytics from './components/Admin/AdminAnalytics'
import StudentManagement from './components/Admin/StudentManagement'
import Layout from './components/Layout/Layout'
import LoadingSpinner from './components/Common/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />
    }
    
    return <Layout>{children}</Layout>
  }

  // Public Route Component (only accessible when not logged in)
  const PublicRoute = ({ children }) => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'student':
          return <Navigate to="/student/dashboard" replace />
        case 'faculty':
          return <Navigate to="/faculty/dashboard" replace />
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />
        default:
          return <Navigate to="/dashboard" replace />
      }
    }
    return children
  }

  return (
    <Router>
      <div className="min-h-screen bg-light-bg">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* General Dashboard Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/submit-activity" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ActivitySubmission />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/student/transcript" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Transcript />
            </ProtectedRoute>
          } />

          {/* Faculty Routes */}
          <Route path="/faculty/dashboard" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/faculty/verification" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <VerificationPortal />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentManagement />
            </ProtectedRoute>
          } />

          {/* Error Routes */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-light-bg">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-soft-red mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-8">You don't have permission to access this resource.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />

          {/* Default Routes */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-light-bg">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-academic-blue mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App