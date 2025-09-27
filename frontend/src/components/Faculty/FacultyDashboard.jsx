import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Users,
  Award,
  Calendar
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pendingActivities: 0,
    approvedToday: 0,
    totalStudents: 0,
    totalApprovals: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        axios.get('/api/faculty/dashboard-stats'),
        axios.get('/api/faculty/recent-activities')
      ])
      
      setStats(statsRes.data.stats || stats)
      setRecentActivities(activitiesRes.data.activities || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
      // Use mock data for demo
      setStats({
        pendingActivities: 8,
        approvedToday: 3,
        totalStudents: 45,
        totalApprovals: 127
      })
      setRecentActivities(mockRecentActivities)
    }
    setLoading(false)
  }

  // Mock data for demo
  const mockRecentActivities = [
    {
      id: 1,
      title: "AI Research Project - Natural Language Processing",
      student_name: "John Doe",
      student_email: "john.doe@university.edu",
      category: "Research",
      status: "pending",
      hours_spent: 120,
      submitted_at: "2024-03-01T10:30:00Z"
    },
    {
      id: 2,
      title: "Web Development Workshop",
      student_name: "Jane Smith",
      student_email: "jane.smith@university.edu",
      category: "Leadership",
      status: "pending",
      hours_spent: 24,
      submitted_at: "2024-02-28T14:15:00Z"
    },
    {
      id: 3,
      title: "Environmental Cleanup Drive",
      student_name: "Mike Johnson",
      student_email: "mike.johnson@university.edu",
      category: "Volunteering",
      status: "approved",
      hours_spent: 6,
      submitted_at: "2024-02-27T09:45:00Z",
      approved_at: "2024-02-28T11:20:00Z"
    }
  ]

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-academic-blue", bgColor = "bg-blue-100" }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', icon: Clock },
      approved: { class: 'badge-approved', icon: CheckCircle },
      rejected: { class: 'badge-rejected', icon: AlertCircle }
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="gradient-header rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Review and verify student activities to support their academic journey
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/faculty/verification" className="btn-secondary flex items-center bg-white text-academic-blue hover:bg-gray-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              <p>Review Activities</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Clock}
          title="Pending Reviews"
          value={stats.pendingActivities}
          subtitle="Awaiting verification"
          color="text-accent-yellow"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved Today"
          value={stats.approvedToday}
          subtitle="Activities verified"
          color="text-growth-green"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Users}
          title="Active Students"
          value={stats.totalStudents}
          subtitle="Under supervision"
          color="text-academic-blue"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Award}
          title="Total Approvals"
          value={stats.totalApprovals}
          subtitle="All time"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Recent Activities */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity Submissions</h2>
          <Link 
            to="/faculty/verification" 
            className="text-academic-blue hover:text-blue-700 text-sm font-medium mt-2 sm:mt-0"
          >
            View All →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
            <p className="text-gray-600">
              Student activity submissions will appear here for your review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="card hover:shadow-academic transition-shadow duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      {getStatusBadge(activity.status)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {activity.student_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.hours_spent} hours
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(activity.submitted_at)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Category: <span className="font-medium">{activity.category}</span>
                      {activity.approved_at && (
                        <span className="ml-4">
                          Approved: {formatDate(activity.approved_at)} at {formatTime(activity.approved_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {activity.status === 'pending' && (
                    <div className="mt-4 md:mt-0 md:ml-4">
                      <Link
                        to="/faculty/verification"
                        className="btn-primary text-sm"
                      >
                        Review
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monday</span>
              <span className="font-medium">5 reviews</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tuesday</span>
              <span className="font-medium">3 reviews</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wednesday</span>
              <span className="font-medium">7 reviews</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today</span>
              <span className="font-medium text-academic-blue">{stats.approvedToday} reviews</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Leadership</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-academic-blue h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-sm font-medium">12</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Research</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-growth-green h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-sm font-medium">16</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volunteering</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-accent-yellow h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <span className="text-sm font-medium">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Faculty Review Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Review activity submissions within 3-5 business days</li>
          <li>• Verify the authenticity and scope of student involvement</li>
          <li>• Provide constructive feedback for rejected activities</li>
          <li>• Ensure activities align with institutional learning outcomes</li>
          <li>• Contact students directly for clarification if needed</li>
        </ul>
      </div>
    </div>
  )
}

export default FacultyDashboard