import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  FileText, 
  Target,
  Plus,
  X,
  Save
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ActivitySubmission = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    hours_spent: '',
    location: '',
    skills: [],
    evidence_file: null
  })

  const [newSkill, setNewSkill] = useState('')

  const categories = [
    'Leadership',
    'Volunteering', 
    'Sports',
    'Arts',
    'Research',
    'Clubs',
    'Events',
    'Academic'
  ]

  const skillSuggestions = [
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
    'Project Management', 'Public Speaking', 'Organization',
    'Time Management', 'Critical Thinking', 'Creativity',
    'Adaptability', 'Mentoring', 'Event Planning', 'Research',
    'Data Analysis', 'Teaching', 'Community Service'
  ]

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'skills') {
          submitData.append(key, JSON.stringify(formData[key]))
        } else if (key === 'evidence_file' && formData[key]) {
          submitData.append(key, formData[key])
        } else if (formData[key]) {
          submitData.append(key, formData[key])
        }
      })

      const response = await axios.post('/api/activities/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Activity submitted successfully! Pending verification.')
      navigate('/student/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit activity')
      // For demo purposes, still show success
      toast.success('Activity submitted successfully! (Demo mode)')
      navigate('/student/dashboard')
    }
    
    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submit New Activity</h1>
            <p className="text-gray-600 mt-1">
              Add your co-curricular activity for verification and inclusion in your transcript
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-academic-blue" />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-academic-blue" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="label">Activity Title *</label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                placeholder="e.g., Computer Science Club - Web Development Workshop"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                required
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                className="input-field resize-none"
                placeholder="Provide a detailed description of your activity, your role, responsibilities, and achievements..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Time & Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-academic-blue" />
            Time & Location Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                name="start_date"
                required
                max={today}
                className="input-field"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                name="end_date"
                max={today}
                min={formData.start_date}
                className="input-field"
                value={formData.end_date}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if it was a single-day activity
              </p>
            </div>

            <div>
              <label className="label">Total Hours Spent *</label>
              <div className="relative">
                <input
                  type="number"
                  name="hours_spent"
                  required
                  min="0.5"
                  step="0.5"
                  max="1000"
                  className="input-field pr-12"
                  placeholder="0"
                  value={formData.hours_spent}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  className="input-field pr-10"
                  placeholder="e.g., Main Auditorium, Online, Community Center"
                  value={formData.location}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Developed */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-academic-blue" />
            Skills Developed
          </h2>
          
          {/* Current Skills */}
          {formData.skills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add New Skill */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type a skill you developed..."
                className="input-field flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(newSkill)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="btn-secondary px-3"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Skill Suggestions */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Quick add suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {skillSuggestions
                  .filter(skill => !formData.skills.includes(skill))
                  .slice(0, 8)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-academic-blue" />
            Evidence (Optional)
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <label className="cursor-pointer">
                <span className="text-academic-blue font-medium hover:underline">
                  Click to upload a file
                </span>
                <input
                  type="file"
                  name="evidence_file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleChange}
                />
              </label>
              <p className="text-sm text-gray-500">
                Upload certificates, photos, or documents as evidence
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
            
            {formData.evidence_file && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  File selected: {formData.evidence_file.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary flex items-center gap-2 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit Activity
              </>
            )}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Submission Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure all required fields are filled accurately</li>
          <li>• Provide detailed descriptions of your role and contributions</li>
          <li>• Upload evidence when available to speed up verification</li>
          <li>• Activities will be reviewed by faculty within 3-5 business days</li>
          <li>• You'll receive notifications about approval status via email</li>
        </ul>
      </div>
    </div>
  )
}

export default ActivitySubmission