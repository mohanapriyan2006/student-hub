import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Award,
  Clock
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('6months')
  const [department, setDepartment] = useState('all')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    trends: [],
    categories: [],
    departments: [],
    skills: [],
    engagement: []
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, department])

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get('/api/admin/analytics', {
        params: { timeRange, department }
      })
      setAnalyticsData(response.data.analytics || mockAnalyticsData)
    } catch (error) {
      toast.error('Failed to load analytics data')
      setAnalyticsData(mockAnalyticsData)
    }
    setLoading(false)
  }

  // Mock data for comprehensive analytics
  const mockAnalyticsData = {
    overview: {
      totalActivities: 3456,
      totalStudents: 1247,
      totalHours: 18953,
      averageHoursPerStudent: 15.2,
      approvalRate: 87.3,
      averageReviewTime: 2.4,
      topCategory: 'Leadership',
      mostActiveMonth: 'March'
    },
    trends: [
      { month: 'Jan', activities: 245, students: 189, hours: 1234, approvals: 213 },
      { month: 'Feb', activities: 387, students: 298, hours: 1876, approvals: 342 },
      { month: 'Mar', activities: 456, students: 356, hours: 2145, approvals: 398 },
      { month: 'Apr', activities: 523, students: 401, hours: 2456, approvals: 456 },
      { month: 'May', activities: 434, students: 378, hours: 2187, approvals: 381 },
      { month: 'Jun', activities: 567, students: 445, hours: 2634, approvals: 498 }
    ],
    categories: [
      { name: 'Leadership', value: 756, percentage: 21.9, hours: 4567, color: '#2E5C9A' },
      { name: 'Volunteering', value: 678, percentage: 19.6, hours: 3234, color: '#4CAF50' },
      { name: 'Research', value: 567, percentage: 16.4, hours: 7890, color: '#E63946' },
      { name: 'Sports', value: 456, percentage: 13.2, hours: 2345, color: '#FFB400' },
      { name: 'Arts', value: 345, percentage: 10.0, hours: 1876, color: '#9C27B0' },
      { name: 'Clubs', value: 389, percentage: 11.3, hours: 2156, color: '#FF9800' },
      { name: 'Events', value: 265, percentage: 7.7, hours: 1234, color: '#795548' }
    ],
    departments: [
      { name: 'Computer Science', students: 342, activities: 1456, avgHours: 18.2, participation: 94.1 },
      { name: 'Business Admin', students: 298, activities: 987, avgHours: 14.6, participation: 87.3 },
      { name: 'Engineering', students: 267, activities: 876, avgHours: 16.8, participation: 91.2 },
      { name: 'Arts & Sciences', students: 189, activities: 654, avgHours: 12.4, participation: 83.7 },
      { name: 'Psychology', students: 151, activities: 483, avgHours: 13.9, participation: 89.4 }
    ],
    skills: [
      { skill: 'Leadership', count: 1234, trending: true },
      { skill: 'Communication', count: 1098, trending: true },
      { skill: 'Teamwork', count: 987, trending: false },
      { skill: 'Problem Solving', count: 876, trending: true },
      { skill: 'Project Management', count: 745, trending: false },
      { skill: 'Research', count: 698, trending: true },
      { skill: 'Public Speaking', count: 567, trending: false },
      { skill: 'Organization', count: 456, trending: true }
    ],
    engagement: [
      { week: 'Week 1', submissions: 45, approvals: 38, rejections: 7 },
      { week: 'Week 2', submissions: 52, approvals: 45, rejections: 7 },
      { week: 'Week 3', submissions: 38, approvals: 33, rejections: 5 },
      { week: 'Week 4', submissions: 61, approvals: 52, rejections: 9 }
    ]
  }

  const COLORS = ['#2E5C9A', '#4CAF50', '#E63946', '#FFB400', '#9C27B0', '#FF9800', '#795548']

  const exportReport = (format) => {
    toast.success(`Exporting analytics report as ${format.toUpperCase()}...`)
    // In a real app, this would trigger a file download
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into student activity engagement and institutional performance
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => exportReport('pdf')}
            className="btn-secondary text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export PDF
          </button>
          <button 
            onClick={() => exportReport('csv')}
            className="btn-secondary text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Analytics Filters</h2>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                className="input-field w-auto"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                className="input-field w-auto"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="cs">Computer Science</option>
                <option value="business">Business Admin</option>
                <option value="engineering">Engineering</option>
                <option value="arts">Arts & Sciences</option>
                <option value="psychology">Psychology</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="card text-center">
          <Activity className="w-6 h-6 text-academic-blue mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.totalActivities?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Total Activities</div>
        </div>
        
        <div className="card text-center">
          <Users className="w-6 h-6 text-growth-green mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.totalStudents?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Active Students</div>
        </div>
        
        <div className="card text-center">
          <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.totalHours?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Total Hours</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 text-accent-yellow mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.averageHoursPerStudent}
          </div>
          <div className="text-xs text-gray-600">Avg Hours/Student</div>
        </div>
        
        <div className="card text-center">
          <Award className="w-6 h-6 text-success-teal mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.approvalRate}%
          </div>
          <div className="text-xs text-gray-600">Approval Rate</div>
        </div>
        
        <div className="card text-center">
          <Clock className="w-6 h-6 text-soft-red mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {analyticsData.overview.averageReviewTime}
          </div>
          <div className="text-xs text-gray-600">Avg Review Days</div>
        </div>
        
        <div className="card text-center">
          <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-gray-900">
            {analyticsData.overview.topCategory}
          </div>
          <div className="text-xs text-gray-600">Top Category</div>
        </div>
        
        <div className="card text-center">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-bold text-gray-900">
            {analyticsData.overview.mostActiveMonth}
          </div>
          <div className="text-xs text-gray-600">Most Active</div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="activities" 
                stackId="1"
                stroke="#2E5C9A" 
                fill="#2E5C9A"
                fillOpacity={0.6}
                name="Activities"
              />
              <Area 
                type="monotone" 
                dataKey="students" 
                stackId="2"
                stroke="#4CAF50" 
                fill="#4CAF50"
                fillOpacity={0.6}
                name="Active Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <PieChart
                  data={analyticsData.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </PieChart>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analyticsData.categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">
                      {category.value} activities • {category.hours} hours
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {category.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Students</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Activities</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Avg Hours</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Participation</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.departments.map((dept, index) => (
                <tr key={dept.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.students}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.activities}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{dept.avgHours}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.participation > 90 
                        ? 'bg-green-100 text-green-800' 
                        : dept.participation > 85 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {dept.participation}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Skills Developed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analyticsData.skills.map((skill, index) => (
            <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="font-medium text-gray-900">{skill.skill}</div>
                {skill.trending && (
                  <TrendingUp className="w-4 h-4 text-growth-green ml-2" />
                )}
              </div>
              <div className="text-sm text-gray-600">{skill.count} students</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Engagement */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Engagement Pattern</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.engagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="submissions" fill="#2E5C9A" name="Submissions" />
              <Bar dataKey="approvals" fill="#4CAF50" name="Approvals" />
              <Bar dataKey="rejections" fill="#E63946" name="Rejections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics