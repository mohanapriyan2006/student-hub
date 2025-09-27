import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Building, 
  Activity,
  Award,
  Clock,
  Eye,
  Download,
  MoreHorizontal
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const StudentManagement = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, departmentFilter, sortBy])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/admin/students')
      setStudents(response.data.students || mockStudents)
    } catch (error) {
      toast.error('Failed to load students')
      setStudents(mockStudents)
    }
    setLoading(false)
  }

  const filterAndSortStudents = () => {
    let filtered = students

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(student => 
        student.department.toLowerCase() === departmentFilter.toLowerCase()
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'activities':
          return b.total_activities - a.total_activities
        case 'hours':
          return b.total_hours - a.total_hours
        case 'department':
          return a.department.localeCompare(b.department)
        default:
          return 0
      }
    })

    setFilteredStudents(filtered)
  }

  // Mock data for demo
  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@university.edu',
      student_id: 'CS2024001',
      department: 'Computer Science',
      year: '3rd Year',
      total_activities: 12,
      approved_activities: 8,
      pending_activities: 3,
      rejected_activities: 1,
      total_hours: 156,
      last_activity: '2024-03-01',
      join_date: '2024-01-15',
      profile_completion: 85
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      student_id: 'BA2024002',
      department: 'Business Administration',
      year: '2nd Year',
      total_activities: 8,
      approved_activities: 6,
      pending_activities: 2,
      rejected_activities: 0,
      total_hours: 98,
      last_activity: '2024-02-28',
      join_date: '2024-01-20',
      profile_completion: 92
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@university.edu',
      student_id: 'EE2024003',
      department: 'Electrical Engineering',
      year: '4th Year',
      total_activities: 15,
      approved_activities: 12,
      pending_activities: 2,
      rejected_activities: 1,
      total_hours: 203,
      last_activity: '2024-03-02',
      join_date: '2024-01-10',
      profile_completion: 78
    },
    {
      id: 4,
      name: 'Sarah Davis',
      email: 'sarah.davis@university.edu',
      student_id: 'PSY2024004',
      department: 'Psychology',
      year: '1st Year',
      total_activities: 5,
      approved_activities: 3,
      pending_activities: 1,
      rejected_activities: 1,
      total_hours: 45,
      last_activity: '2024-02-25',
      join_date: '2024-01-25',
      profile_completion: 65
    },
    {
      id: 5,
      name: 'Alex Wilson',
      email: 'alex.wilson@university.edu',
      student_id: 'AS2024005',
      department: 'Arts & Sciences',
      year: '2nd Year',
      total_activities: 10,
      approved_activities: 7,
      pending_activities: 2,
      rejected_activities: 1,
      total_hours: 127,
      last_activity: '2024-03-01',
      join_date: '2024-01-18',
      profile_completion: 88
    }
  ]

  const handleViewStudent = (student) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const exportStudentData = () => {
    toast.success('Exporting student data as CSV...')
    // In real app, this would trigger CSV download
  }

  const getStatusColor = (completion) => {
    if (completion >= 90) return 'text-green-600 bg-green-100'
    if (completion >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    )
  }

  const departments = [...new Set(students.map(s => s.department))]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">
            Manage student profiles and monitor their activity engagement
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={exportStudentData}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <User className="w-8 h-8 text-academic-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="card text-center">
          <Activity className="w-8 h-8 text-growth-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {students.reduce((sum, s) => sum + s.total_activities, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Activities</div>
        </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {students.reduce((sum, s) => sum + s.total_hours, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
        <div className="card text-center">
          <Award className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(students.reduce((sum, s) => sum + s.profile_completion, 0) / students.length)}%
          </div>
          <div className="text-sm text-gray-600">Avg Profile Completion</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="input-field pl-10 pr-4 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="input-field pl-10 pr-8 w-full md:w-auto"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="input-field w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="activities">Sort by Activities</option>
              <option value="hours">Sort by Hours</option>
              <option value="department">Sort by Department</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Activities</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Hours</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Profile</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Last Active</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-academic-blue rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.student_id}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{student.department}</div>
                    <div className="text-sm text-gray-600">{student.year}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-gray-900 font-medium">{student.total_activities}</div>
                    <div className="text-xs text-gray-600">
                      {student.approved_activities}✓ {student.pending_activities}⏳ {student.rejected_activities}✗
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-gray-900 font-medium">{student.total_hours}</div>
                    <div className="text-xs text-gray-600">hours logged</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(student.profile_completion)
                    }`}>
                      {student.profile_completion}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {formatDate(student.last_activity)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleViewStudent(student)}
                      className="text-academic-blue hover:text-blue-700 mr-2"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="More Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm || departmentFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No students are registered in the system'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Student Details</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-academic-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h4>
                  <div className="text-gray-600">{selectedStudent.student_id} • {selectedStudent.department}</div>
                  <div className="text-gray-500">{selectedStudent.email}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-academic-blue">{selectedStudent.total_activities}</div>
                  <div className="text-sm text-gray-600">Total Activities</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-growth-green">{selectedStudent.approved_activities}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-accent-yellow">{selectedStudent.pending_activities}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{selectedStudent.total_hours}</div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-700">Year:</strong>
                  <div className="text-gray-600">{selectedStudent.year}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Join Date:</strong>
                  <div className="text-gray-600">{formatDate(selectedStudent.join_date)}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Last Activity:</strong>
                  <div className="text-gray-600">{formatDate(selectedStudent.last_activity)}</div>
                </div>
                <div>
                  <strong className="text-gray-700">Profile Completion:</strong>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(selectedStudent.profile_completion)
                  }`}>
                    {selectedStudent.profile_completion}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <a
                  href={`mailto:${selectedStudent.email}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </a>
                <button className="btn-secondary">
                  View Activities
                </button>
                <button 
                  onClick={() => setShowStudentModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement