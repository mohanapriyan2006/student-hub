import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  Download, 
  Award, 
  Calendar, 
  Clock, 
  User,
  Building,
  Mail,
  FileText,
  Star
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

const Transcript = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchApprovedActivities()
  }, [])

  const fetchApprovedActivities = async () => {
    try {
      // In real app, this would fetch only approved activities
      setActivities(mockApprovedActivities)
    } catch (error) {
      toast.error('Failed to load activities')
      setActivities(mockApprovedActivities)
    }
    setLoading(false)
  }

  // Mock approved activities for demo
  const mockApprovedActivities = [
    {
      id: 1,
      title: "Computer Science Club - Web Development Workshop",
      description: "Organized and conducted a 3-day web development workshop for junior students, covering HTML, CSS, and JavaScript fundamentals.",
      category: "Leadership",
      start_date: "2024-01-15",
      end_date: "2024-01-17",
      hours_spent: 24,
      location: "Computer Lab A",
      skills: ["Leadership", "Teaching", "Web Development"],
      verified_by: "Dr. Sarah Johnson",
      verification_date: "2024-01-20"
    },
    {
      id: 2,
      title: "University Blood Donation Drive",
      description: "Volunteered as a coordinator for the annual blood donation drive, helping with registration and donor care.",
      category: "Volunteering",
      start_date: "2024-02-20",
      hours_spent: 8,
      location: "Main Auditorium",
      skills: ["Organization", "Communication", "Community Service"],
      verified_by: "Prof. Michael Davis",
      verification_date: "2024-02-25"
    },
    {
      id: 4,
      title: "Inter-College Basketball Tournament",
      description: "Represented university in the annual inter-college basketball tournament, reached semi-finals.",
      category: "Sports",
      start_date: "2024-01-10",
      end_date: "2024-01-12",
      hours_spent: 16,
      location: "Sports Complex",
      skills: ["Teamwork", "Leadership", "Athletic Performance"],
      verified_by: "Coach Robert Wilson",
      verification_date: "2024-01-15"
    },
    {
      id: 5,
      title: "Annual Cultural Festival - Event Coordinator",
      description: "Led a team of 15 volunteers to organize the annual cultural festival, managing logistics, scheduling, and vendor coordination.",
      category: "Leadership",
      start_date: "2023-11-15",
      end_date: "2023-11-17",
      hours_spent: 40,
      location: "Main Campus",
      skills: ["Event Management", "Team Leadership", "Problem Solving"],
      verified_by: "Dr. Emily Chen",
      verification_date: "2023-11-20"
    }
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalStats = () => {
    return {
      totalActivities: activities.length,
      totalHours: activities.reduce((sum, activity) => sum + activity.hours_spent, 0),
      categories: [...new Set(activities.map(a => a.category))].length,
      skills: [...new Set(activities.flatMap(a => a.skills || []))].length
    }
  }

  const getActivitiesByCategory = () => {
    return activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = []
      }
      acc[activity.category].push(activity)
      return acc
    }, {})
  }

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const element = document.getElementById('transcript-content')
      
      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `${user?.name?.replace(/\s+/g, '_')}_Co-Curricular_Transcript_${new Date().getFullYear()}.pdf`
      pdf.save(fileName)
      
      toast.success('Transcript downloaded successfully!')
    } catch (error) {
      toast.error('Failed to generate PDF. Please try again.')
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue"></div>
      </div>
    )
  }

  const stats = getTotalStats()
  const activitiesByCategory = getActivitiesByCategory()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Download Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Co-Curricular Transcript</h1>
          <p className="text-gray-600 mt-1">
            Official record of verified extracurricular activities and achievements
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={generatePDF}
            disabled={generating}
            className={`btn-primary flex items-center gap-2 ${
              generating ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div id="transcript-content" className="bg-white">
        {/* Header Section */}
        <div className="border-b-2 border-academic-blue pb-6 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-academic-blue mb-2">
              UNIVERSITY NAME
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">
              Co-Curricular Activities Transcript
            </h2>
            <p className="text-gray-600">Official Academic Record</p>
          </div>

          {/* Student Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {user?.name}
              </div>
              <div>
                <strong>Student ID:</strong> {user?.student_id || 'CS2024001'}
              </div>
              <div>
                <strong>Email:</strong> {user?.email}
              </div>
              <div>
                <strong>Department:</strong> {user?.department || 'Computer Science'}
              </div>
              <div>
                <strong>Academic Year:</strong> 2023-2024
              </div>
              <div>
                <strong>Transcript Date:</strong> {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Summary of Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-academic-blue">{stats.totalActivities}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-growth-green">{stats.totalHours}</div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-accent-yellow">{stats.skills}</div>
              <div className="text-sm text-gray-600">Skills Developed</div>
            </div>
          </div>
        </div>

        {/* Activities by Category */}
        <div className="space-y-8">
          {Object.entries(activitiesByCategory).map(([category, categoryActivities]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {category} Activities ({categoryActivities.length})
              </h3>
              
              <div className="space-y-4">
                {categoryActivities.map((activity, index) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                      <span className="text-sm text-gray-500">
                        {activity.hours_spent} hours
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(activity.start_date)}
                        {activity.end_date && ` - ${formatDate(activity.end_date)}`}
                      </div>
                      {activity.location && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          {activity.location}
                        </div>
                      )}
                    </div>

                    {activity.skills && activity.skills.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Skills Developed:</div>
                        <div className="flex flex-wrap gap-1">
                          {activity.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <strong>Verified by:</strong> {activity.verified_by} on {formatDate(activity.verification_date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-academic-blue pt-6 mt-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              This is an official co-curricular activities transcript issued by University Name.
            </p>
            <p className="mb-2">
              All activities listed have been verified by authorized faculty members.
            </p>
            <p>
              Generated on {formatDate(new Date().toISOString())} | 
              Transcript ID: TR-{user?.student_id || 'CS2024001'}-{new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About This Transcript</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This transcript includes only verified co-curricular activities</li>
          <li>• All activities have been approved by authorized faculty members</li>
          <li>• Skills listed are self-reported and activity-based assessments</li>
          <li>• This document complements your academic transcript</li>
          <li>• For verification inquiries, contact the Student Activities Office</li>
        </ul>
      </div>
    </div>
  )
}

export default Transcript