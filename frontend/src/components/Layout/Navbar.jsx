import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  User, 
  FileText, 
  Award, 
  PlusCircle, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: Home },
          { path: '/student/submit-activity', label: 'Submit Activity', icon: PlusCircle },
          { path: '/student/profile', label: 'Profile', icon: User },
          { path: '/student/transcript', label: 'Transcript', icon: Award }
        ]
      case 'faculty':
        return [
          { path: '/faculty/dashboard', label: 'Dashboard', icon: Home },
          { path: '/faculty/verification', label: 'Verify Activities', icon: CheckCircle }
        ]
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
          { path: '/admin/students', label: 'Student Management', icon: Users },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 }
        ]
      default:
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Home }
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="w-8 h-8 text-academic-blue" />
              <span className="ml-2 text-xl font-bold text-academic-blue">
                StudentHub
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-academic-blue text-white'
                          : 'text-gray-600 hover:text-academic-blue hover:bg-blue-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-academic-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-soft-red hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex space-x-1 overflow-x-auto py-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'bg-academic-blue text-white'
                    : 'text-gray-600 hover:text-academic-blue hover:bg-blue-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar