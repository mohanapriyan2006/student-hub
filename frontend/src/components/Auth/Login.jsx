import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, Mail, Lock, User, Building, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    department: '',
    role: 'student'
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData)
      }

      if (result.success) {
        // Navigation is handled by the auth context and App.jsx
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      name: '',
      studentId: '',
      department: '',
      role: 'student'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-academic py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <GraduationCap className="w-10 h-10 text-academic-blue" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white text-shadow">
            Student Activity Records
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Higher Education Institution Management System
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isLogin
                    ? 'bg-academic-blue text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                  !isLogin
                    ? 'bg-academic-blue text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="label">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <Building className="w-4 h-4 inline mr-2" />
                      Student/Employee ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      required
                      className="input-field"
                      placeholder="ID Number"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="label">
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Role
                    </label>
                    <select
                      name="role"
                      className="input-field"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <Building className="w-4 h-4 inline mr-2" />
                    Department
                  </label>
                  <select
                    name="department"
                    required
                    className="input-field"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Psychology">Psychology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Economics">Economics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary py-3 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isLogin ? 'Logging in...' : 'Registering...'}
                  </div>
                ) : (
                  isLogin ? 'Login' : 'Register'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-600">
              <div className="p-2 bg-gray-50 rounded">
                <strong>Student:</strong> student@university.edu / password123
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>Faculty:</strong> faculty@university.edu / password123
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <strong>Admin:</strong> admin@university.edu / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login