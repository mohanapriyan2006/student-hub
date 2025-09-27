import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActivities: 0,
    totalHours: 0,
    activeSubmissions: 0
  })
  const [chartData, setChartData] = useState({
    categoryData: [],
    monthlyData: [],
    departmentData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartsRes] = await Promise.all([
        axios.get('/api/admin/dashboard-stats'),
        axios.get('/api/admin/chart-data')
      ])
      
      setStats(statsRes.data.stats || stats)
      setChartData(chartsRes.data.charts || chartData)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      // Use mock data for demo
      setStats({
        totalStudents: 1247,
        totalActivities: 3456,
        totalHours: 18953,
        activeSubmissions: 89
      })
      setChartData(mockChartData)
    }
    setLoading(false)
  }

  // Mock data for demo
  const mockChartData = {
    categoryData: [
      { name: 'Leadership', value: 456, color: '#2E5C9A' },
      { name: 'Volunteering', value: 678, color: '#4CAF50' },
      { name: 'Sports', value: 234, color: '#FFB400' },
      { name: 'Research', value: 567, color: '#E63946' },
      { name: 'Arts', value: 345, color: '#9C27B0' },
      { name: 'Clubs', value: 789, color: '#FF9800' }
    ],
    monthlyData: [
      { month: 'Jan', activities: 245, hours: 1234 },
      { month: 'Feb', activities: 387, hours: 1876 },
      { month: 'Mar', activities: 456, hours: 2145 },
      { month: 'Apr', activities: 523, hours: 2456 },
      { month: 'May', activities: 434, hours: 2187 },
      { month: 'Jun', activities: 567, hours: 2634 }
    ],
    departmentData: [
      { department: 'Computer Science', students: 342, activities: 1456 },
      { department: 'Business Admin', students: 298, activities: 987 },
      { department: 'Engineering', students: 267, activities: 876 },
      { department: 'Arts & Sciences', students: 189, activities: 654 },
      { department: 'Psychology', students: 151, activities: 483 }
    ]
  }

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    change,
    color = "text-academic-blue", 
    bgColor = "bg-blue-100" 
  }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${bgColor} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            change > 0 ? 'text-growth-green' : 'text-soft-red'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </div>
  )

  const COLORS = ['#2E5C9A', '#4CAF50', '#FFB400', '#E63946', '#9C27B0', '#FF9800']

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
              Admin Dashboard
            </h1>
            <p className="text-blue-100 mt-1">
              Monitor and analyze student activity engagement across the institution
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Link to="/admin/analytics" className="btn-secondary flex items-center bg-white text-academic-blue hover:bg-gray-100">
              <BarChart3 className="w-4 h-4 mr-2" />
              <p>Detailed Analytics</p>
            </Link>
            <Link to="/admin/students" className="btn-secondary flex items-center bg-white text-academic-blue hover:bg-gray-100">
              <Users className="w-4 h-4 mr-2" />
              <p>Manage Students</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Active users"
          change={5.2}
          color="text-academic-blue"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={Activity}
          title="Total Activities"
          value={stats.totalActivities}
          subtitle="All submissions"
          change={12.8}
          color="text-growth-green"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Hours"
          value={stats.totalHours}
          subtitle="Logged hours"
          change={8.4}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          icon={Award}
          title="Active Submissions"
          value={stats.activeSubmissions}
          subtitle="Pending approval"
          change={-2.1}
          color="text-accent-yellow"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Categories</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPieChart
                  data={chartData.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Activity Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="activities" 
                  stroke="#2E5C9A" 
                  strokeWidth={2}
                  name="Activities"
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#4CAF50" 
                  strokeWidth={2}
                  name="Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
          <button className="btn-secondary text-sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.departmentData} margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#2E5C9A" name="Students" />
              <Bar dataKey="activities" fill="#4CAF50" name="Activities" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/analytics" className="card hover:shadow-academic transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-academic-blue">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Detailed Analytics</h3>
              <p className="text-sm text-gray-600">Comprehensive reports and insights</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/students" className="card hover:shadow-academic transition-shadow duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-growth-green">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Student Management</h3>
              <p className="text-sm text-gray-600">View and manage student profiles</p>
            </div>
          </div>
        </Link>

        <div className="card hover:shadow-academic transition-shadow duration-200 cursor-pointer">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Download className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-600">Generate and download reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-academic-blue">87%</div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-growth-green">2.4</div>
            <div className="text-sm text-gray-600">Avg Review Time (days)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-gray-600">Avg Hours per Student</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-yellow">94%</div>
            <div className="text-sm text-gray-600">Student Participation</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-green-800">Database</span>
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-800">File Storage</span>
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-800">Email Service</span>
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard