import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  Activity, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar, 
  PlusCircle,
  Eye
} from 'lucide-react'
import ActivityCard from '../Common/ActivityCard'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalHours: 0,
    approvedActivities: 0,
    pendingActivities: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [activitiesRes, statsRes] = await Promise.all([
        axios.get('/api/activities/my-activities'),
        axios.get('/api/activities/my-stats')
      ])
      
      setActivities(activitiesRes.data.activities || [])
      setStats(statsRes.data.stats || stats)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      // Use mock data for demo
      setActivities(mockActivities)
      setStats({
        totalActivities: 12,
        totalHours: 156,
        approvedActivities: 8,
        pendingActivities: 4
      })
    }
    setLoading(false)
  }

  // Mock data for demo
  const mockActivities = [
    {
      id: 1,
      title: "Computer Science Club - Web Development Workshop",
      description: "Organized and conducted a 3-day web development workshop for junior students, covering HTML, CSS, and JavaScript fundamentals.",
      category: "Leadership",
      status: "approved",
      start_date: "2024-01-15",
      end_date: "2024-01-17",
      hours_spent: 24,
      location: "Computer Lab A",
      skills: ["Leadership", "Teaching", "Web Development"],
      created_at: "2024-01-10",
      updated_at: "2024-01-20"
    },
    {
      id: 2,
      title: "University Blood Donation Drive",
      description: "Volunteered as a coordinator for the annual blood donation drive, helping with registration and donor care.",
      category: "Volunteering",
      status: "approved",
      start_date: "2024-02-20",
      hours_spent: 8,
      location: "Main Auditorium",
      skills: ["Organization", "Communication", "Community Service"],
      created_at: "2024-02-15",
      updated_at: "2024-02-25"
    },
    {
      id: 3,
      title: "AI Research Project - Natural Language Processing",
      description: "Participated in a research project focused on sentiment analysis using machine learning techniques under Dr. Smith's guidance.",
      category: "Research",
      status: "pending",
      start_date: "2024-03-01",
      end_date: "2024-05-30",
      hours_spent: 120,
      skills: ["Machine Learning", "Python", "Research", "Data Analysis"],
      created_at: "2024-02-28",
      updated_at: "2024-03-01"
    },
    {
      id: 4,
      title: "Inter-College Basketball Tournament",
      description: "Represented university in the annual inter-college basketball tournament, reached semi-finals.",
      category: "Sports",
      status: "approved",
      start_date: "2024-01-10",
      end_date: "2024-01-12",
      hours_spent: 16,
      location: "Sports Complex",
      skills: ["Teamwork", "Leadership", "Athletic Performance"],
      created_at: "2024-01-05",
      updated_at: "2024-01-15"
    }
  ]

  const handleViewEvidence = (activity) => {
    setSelectedActivity(activity)
    // In a real app, this would open a modal or navigate to evidence view
    toast.success('Evidence viewing feature - coming soon!')
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-academic-blue" }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-blue-100 ${color}`}>
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
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Track your co-curricular activities and build your comprehensive profile
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/student/submit-activity" className="btn-secondary flex items-center bg-white text-academic-blue hover:bg-gray-100">
              <PlusCircle className="w-4 h-4 mr-2" />
              <p>Add Activity</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Activity}
          title="Total Activities"
          value={stats.totalActivities}
          subtitle="All time"
        />
        <StatCard
          icon={Clock}
          title="Total Hours"
          value={stats.totalHours}
          subtitle="Logged hours"
          color="text-growth-green"
        />
        <StatCard
          icon={Award}
          title="Approved"
          value={stats.approvedActivities}
          subtitle="Verified activities"
          color="text-success-teal"
        />
        <StatCard
          icon={TrendingUp}
          title="Pending"
          value={stats.pendingActivities}
          subtitle="Awaiting approval"
          color="text-accent-yellow"
        />
      </div>

      {/* Recent Activities */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Link 
              to="/student/profile" 
              className="text-academic-blue hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View All
            </Link>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="card text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your co-curricular profile by adding your first activity
            </p>
            <Link to="/student/submit-activity" className="btn-primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Your First Activity
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activities.slice(0, 6).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onView={handleViewEvidence}
                showStatus={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/student/submit-activity" className="card hover:shadow-academic transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-growth-green">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Submit New Activity</h3>
              <p className="text-sm text-gray-600">Add your latest activity for verification</p>
            </div>
          </div>
        </Link>

        <Link to="/student/transcript" className="card hover:shadow-academic transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Download Transcript</h3>
              <p className="text-sm text-gray-600">Generate your co-curricular transcript</p>
            </div>
          </div>
        </Link>

        <Link to="/student/profile" className="card hover:shadow-academic transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-academic-blue">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">View Full Profile</h3>
              <p className="text-sm text-gray-600">See all your activities and achievements</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default StudentDashboard