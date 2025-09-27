import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Filter,
  Search,
  User,
  Calendar,
  FileText
} from 'lucide-react'
import ActivityCard from '../Common/ActivityCard'
import axios from 'axios'
import toast from 'react-hot-toast'

const VerificationPortal = () => {
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [activities, filter, searchTerm])

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/faculty/activities-to-review')
      setActivities(response.data.activities || [])
    } catch (error) {
      toast.error('Failed to load activities')
      // Use mock data for demo
      setActivities(mockActivities)
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
        activity.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredActivities(filtered)
  }

  // Mock data for demo
  const mockActivities = [
    {
      id: 1,
      title: "AI Research Project - Natural Language Processing",
      description: "Participated in a research project focused on sentiment analysis using machine learning techniques under Dr. Smith's guidance. Worked on data preprocessing, model training, and evaluation metrics.",
      category: "Research",
      status: "pending",
      start_date: "2024-03-01",
      end_date: "2024-05-30",
      hours_spent: 120,
      location: "AI Lab",
      skills: ["Machine Learning", "Python", "Research", "Data Analysis"],
      student_name: "John Doe",
      student_email: "john.doe@university.edu",
      student_id: "CS2024001",
      submitted_at: "2024-03-01T10:30:00Z",
      evidence_url: "/api/files/evidence_1.pdf"
    },
    {
      id: 2,
      title: "Computer Science Club - Web Development Workshop",
      description: "Organized and conducted a 3-day web development workshop for junior students, covering HTML, CSS, and JavaScript fundamentals. Managed 50+ participants and coordinated with industry speakers.",
      category: "Leadership",
      status: "pending",
      start_date: "2024-01-15",
      end_date: "2024-01-17",
      hours_spent: 24,
      location: "Computer Lab A",
      skills: ["Leadership", "Teaching", "Web Development", "Event Management"],
      student_name: "Jane Smith",
      student_email: "jane.smith@university.edu",
      student_id: "CS2024002",
      submitted_at: "2024-02-28T14:15:00Z",
      evidence_url: "/api/files/evidence_2.pdf"
    },
    {
      id: 3,
      title: "University Blood Donation Drive",
      description: "Volunteered as a coordinator for the annual blood donation drive, helping with registration and donor care. Successfully coordinated 200+ donors.",
      category: "Volunteering",
      status: "approved",
      start_date: "2024-02-20",
      hours_spent: 8,
      location: "Main Auditorium",
      skills: ["Organization", "Communication", "Community Service"],
      student_name: "Mike Johnson",
      student_email: "mike.johnson@university.edu",
      student_id: "CS2024003",
      submitted_at: "2024-02-27T09:45:00Z",
      approved_at: "2024-02-28T11:20:00Z",
      verified_by: "Dr. Sarah Wilson"
    },
    {
      id: 4,
      title: "Environmental Cleanup Drive",
      description: "Participated in the city-wide environmental cleanup drive, focusing on campus and surrounding areas.",
      category: "Volunteering",
      status: "rejected",
      start_date: "2024-02-10",
      hours_spent: 6,
      location: "Campus Grounds",
      skills: ["Environmental Awareness", "Community Service"],
      student_name: "Sarah Davis",
      student_email: "sarah.davis@university.edu",
      student_id: "CS2024004",
      submitted_at: "2024-02-08T16:30:00Z",
      rejected_at: "2024-02-15T13:45:00Z",
      comments: "Please provide evidence documentation (photos, certificates, or supervisor confirmation) for verification. Activity description needs more detail about specific contributions."
    }
  ]

  const handleApprove = async (activityId) => {
    setActionLoading(true)
    try {
      await axios.put(`/api/faculty/activities/${activityId}/approve`)
      
      // Update the activity in state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved', approved_at: new Date().toISOString() }
            : activity
        )
      )
      
      toast.success('Activity approved successfully!')
    } catch (error) {
      toast.error('Failed to approve activity')
      // For demo, still update the state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: 'approved', approved_at: new Date().toISOString() }
            : activity
        )
      )
      toast.success('Activity approved! (Demo mode)')
    }
    setActionLoading(false)
  }

  const handleReject = (activityId) => {
    setSelectedActivity(activityId)
    setShowRejectModal(true)
    setRejectComment('')
  }

  const confirmReject = async () => {
    if (!rejectComment.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setActionLoading(true)
    try {
      await axios.put(`/api/faculty/activities/${selectedActivity}/reject`, {
        comment: rejectComment
      })
      
      // Update the activity in state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === selectedActivity 
            ? { 
                ...activity, 
                status: 'rejected', 
                rejected_at: new Date().toISOString(),
                comments: rejectComment
              }
            : activity
        )
      )
      
      toast.success('Activity rejected with feedback')
    } catch (error) {
      toast.error('Failed to reject activity')
      // For demo, still update the state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === selectedActivity 
            ? { 
                ...activity, 
                status: 'rejected', 
                rejected_at: new Date().toISOString(),
                comments: rejectComment
              }
            : activity
        )
      )
      toast.success('Activity rejected! (Demo mode)')
    }
    
    setActionLoading(false)
    setShowRejectModal(false)
    setSelectedActivity(null)
    setRejectComment('')
  }

  const handleViewEvidence = (activity) => {
    // In a real app, this would open/download the evidence file
    toast.success(`Viewing evidence for: ${activity.title}`)
  }

  const getStatusCounts = () => {
    return {
      all: activities.length,
      pending: activities.filter(a => a.status === 'pending').length,
      approved: activities.filter(a => a.status === 'approved').length,
      rejected: activities.filter(a => a.status === 'rejected').length
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Verification Portal</h1>
            <p className="text-gray-600 mt-1">
              Review and verify student co-curricular activity submissions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-yellow" />
                <span>{statusCounts.pending} Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-growth-green" />
                <span>{statusCounts.approved} Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: `All (${statusCounts.all})` },
              { key: 'pending', label: `Pending (${statusCounts.pending})` },
              { key: 'approved', label: `Approved (${statusCounts.approved})` },
              { key: 'rejected', label: `Rejected (${statusCounts.rejected})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === tab.key
                    ? 'bg-academic-blue text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities or students..."
              className="input-field pl-10 pr-4 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No activities found' : `No ${filter} activities`}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : `There are no ${filter} activities at this time`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="card hover:shadow-academic transition-shadow duration-200">
                <ActivityCard
                  activity={{
                    ...activity,
                    student_name: activity.student_name
                  }}
                  showActions={activity.status === 'pending'}
                  onApprove={() => handleApprove(activity.id)}
                  onReject={() => handleReject(activity.id)}
                  onView={() => handleViewEvidence(activity)}
                />
                
                {/* Additional Faculty-specific Information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {activity.student_id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Submitted: {new Date(activity.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <a 
                        href={`mailto:${activity.student_email}`}
                        className="text-academic-blue hover:text-blue-700 text-sm"
                      >
                        Contact Student
                      </a>
                    </div>
                  </div>
                  
                  {activity.status === 'approved' && activity.approved_at && (
                    <div className="mt-2 text-xs text-green-600">
                      ✓ Approved on {new Date(activity.approved_at).toLocaleDateString()}
                      {activity.verified_by && ` by ${activity.verified_by}`}
                    </div>
                  )}
                  
                  {activity.status === 'rejected' && activity.rejected_at && (
                    <div className="mt-2 text-xs text-red-600">
                      ✗ Rejected on {new Date(activity.rejected_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-soft-red mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Activity</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this activity. Your feedback will help the student improve their submission.
            </p>
            
            <textarea
              className="input-field w-full h-24 resize-none"
              placeholder="Explain why this activity is being rejected and what the student needs to provide for approval..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedActivity(null)
                  setRejectComment('')
                }}
                className="btn-secondary flex-1"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className={`btn-danger flex-1 ${
                  actionLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={actionLoading || !rejectComment.trim()}
              >
                {actionLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Rejecting...
                  </div>
                ) : (
                  'Reject Activity'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Verification Guidelines
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Verify the authenticity and educational value of the activity</li>
          <li>• Ensure the student's role and contributions are clearly described</li>
          <li>• Check that hours logged are reasonable for the activity type</li>
          <li>• Review any uploaded evidence for authenticity</li>
          <li>• Provide constructive feedback for rejected activities</li>
          <li>• Contact students directly if clarification is needed</li>
        </ul>
      </div>
    </div>
  )
}

export default VerificationPortal