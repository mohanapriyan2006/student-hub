import React from 'react'
import { Calendar, Clock, User, MapPin, Target, Award } from 'lucide-react'

const ActivityCard = ({ 
  activity, 
  onApprove, 
  onReject, 
  showActions = false, 
  showStatus = true,
  onView
}) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', icon: Clock },
      approved: { class: 'badge-approved', icon: Award },
      rejected: { class: 'badge-rejected', icon: Target }
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

  const getCategoryColor = (category) => {
    const colors = {
      'Leadership': 'bg-purple-100 text-purple-800',
      'Volunteering': 'bg-green-100 text-green-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Arts': 'bg-pink-100 text-pink-800',
      'Research': 'bg-blue-100 text-blue-800',
      'Clubs': 'bg-indigo-100 text-indigo-800',
      'Events': 'bg-yellow-100 text-yellow-800',
      'Academic': 'bg-gray-100 text-gray-800'
    }
    
    return colors[category] || colors.Academic
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card hover:shadow-academic transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {activity.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${getCategoryColor(activity.category)}`}>
              {activity.category}
            </span>
            {showStatus && getStatusBadge(activity.status)}
          </div>
        </div>
        {activity.evidence_url && (
          <button
            onClick={() => onView?.(activity)}
            className="text-academic-blue hover:text-blue-700 text-sm font-medium"
          >
            View Evidence
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {activity.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(activity.start_date)}
            {activity.end_date && ` - ${formatDate(activity.end_date)}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{activity.hours_spent} hours</span>
        </div>
        {activity.location && (
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4" />
            <span>{activity.location}</span>
          </div>
        )}
        {activity.student_name && (
          <div className="flex items-center gap-2 col-span-2">
            <User className="w-4 h-4" />
            <span>{activity.student_name}</span>
          </div>
        )}
      </div>

      {activity.skills && activity.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Developed:</h4>
          <div className="flex flex-wrap gap-1">
            {activity.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {activity.comments && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Comments:</h4>
          <p className="text-sm text-gray-600">{activity.comments}</p>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onApprove?.(activity.id)}
            className="btn-success flex-1"
          >
            Approve
          </button>
          <button
            onClick={() => onReject?.(activity.id)}
            className="btn-danger flex-1"
          >
            Reject
          </button>
        </div>
      )}

      {activity.updated_at && (
        <div className="text-xs text-gray-400 mt-2">
          Last updated: {formatDate(activity.updated_at)}
        </div>
      )}
    </div>
  )
}

export default ActivityCard