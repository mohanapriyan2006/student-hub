import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  User, 
  Mail, 
  Building, 
  Calendar, 
  Award,
  TrendingUp,
  Clock,
  Filter,
  Search
} from 'lucide-react'
import ActivityCard from '../Common/ActivityCard'
import axios from 'axios'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalHours: 0,
    approvedActivities: 0,
    skillCount: 0
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, filter, searchTerm])

  const fetchProfileData = async () => {
    try {
      const [activitiesRes, statsRes] = await Promise.all([
        axios.get('/api/activities/my-activities'),
        axios.get('/api/activities/my-stats')
      ])
      
      setActivities(activitiesRes.data.activities || [])
      setStats(statsRes.data.stats || stats)
    } catch (error) {
      toast.error('Failed to load profile data')
      // Use mock data for demo
      setActivities(mockActivities)
      setStats({
        totalActivities: 12,
        totalHours: 156,
        approvedActivities: 8,
        skillCount: 25
      })
    }
    setLoading(false)
  }

  const filterActivities = () => {
    let filtered = activities

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(activity => activity.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredActivities(filtered)
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
    },
    {
      id: 5,
      title: "Annual Cultural Festival - Event Coordinator",
      description: "Led a team of 15 volunteers to organize the annual cultural festival, managing logistics, scheduling, and vendor coordination.",
      category: "Leadership",
      status: "approved",
      start_date: "2023-11-15",
      end_date: "2023-11-17",
      hours_spent: 40,
      location: "Main Campus",
      skills: ["Event Management", "Team Leadership", "Problem Solving"],
      created_at: "2023-11-01",
      updated_at: "2023-11-20"
    },
    {
      id: 6,
      title: "Environmental Cleanup Drive",
      description: "Participated in the city-wide environmental cleanup drive, focusing on campus and surrounding areas.",
      category: "Volunteering",
      status: "rejected",
      start_date: "2024-02-10",
      hours_spent: 6,
      location: "Campus Grounds",
      skills: ["Environmental Awareness", "Community Service"],
      comments: "Please provide evidence documentation for verification.",
      created_at: "2024-02-08",
      updated_at: "2024-02-15"
    }
  ]

  const getAllSkills = () => {
    const allSkills = activities.reduce((skills, activity) => {
      if (activity.skills) {
        activity.skills.forEach(skill => {
          if (!skills.includes(skill)) {
            skills.push(skill)
          }
        })
      }
      return skills
    }, [])
    return allSkills
  }

  const getCategoryDistribution = () => {
    const distribution = activities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1
      return acc
    }, {})
    return Object.entries(distribution).map(([category, count]) => ({ category, count }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    )
  }

  const allSkills = getAllSkills()
  const categoryDistribution = getCategoryDistribution()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-academic rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {user?.email}
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {user?.department || 'Computer Science'}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {user?.student_id || 'CS2024001'}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <div className="text-2xl font-bold text-academic-blue">{stats.totalActivities}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-academic-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalActivities}</div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-growth-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalHours}</div>
          <div className="text-sm text-gray-600">Hours Logged</div>
        </div>
        <div className="card text-center">
          <Award className="w-8 h-8 text-success-teal mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stats.approvedActivities}</div>
          <div className="text-sm text-gray-600">Verified Activities</div>
        </div>
        <div className="card text-center">
          <Calendar className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{allSkills.length}</div>
          <div className="text-sm text-gray-600">Skills Developed</div>
        </div>
      </div>

      {/* Skills Overview */}
      {allSkills.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Portfolio</h2>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {categoryDistribution.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryDistribution.map(({ category, count }) => (
              <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-academic-blue">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">My Activities</h2>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                className="input-field pl-10 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="input-field pl-10 pr-8 w-full md:w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start by adding your first activity'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                showStatus={true}
                onView={(activity) => toast.success('Evidence viewing feature - coming soon!')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile