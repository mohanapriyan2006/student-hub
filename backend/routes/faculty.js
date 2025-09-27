import express from 'express'
import { body, validationResult } from 'express-validator'
import pool from '../config/database.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/faculty/pending-activities
// @desc    Get all pending activities for faculty review
// @access  Private (Faculty and Admin only)
router.get('/pending-activities', [
  authenticateToken,
  authorizeRoles('faculty', 'admin')
], async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT a.*, u.name as student_name, u.email as student_email, u.student_id, u.department
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.status = 'pending'
    `
    const queryParams = []
    let paramCount = 0

    if (category && category !== 'all') {
      query += ` AND a.category = $${++paramCount}`
      queryParams.push(category)
    }

    query += ` ORDER BY a.created_at ASC LIMIT $${++paramCount} OFFSET $${++paramCount}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM activities a WHERE a.status = \'pending\''
    const countParams = []
    
    if (category && category !== 'all') {
      countQuery += ' AND a.category = $1'
      countParams.push(category)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalCount = parseInt(countResult.rows[0].count)

    res.json({
      activities: result.rows.map(activity => ({
        ...activity,
        skills: typeof activity.skills === 'string' ? JSON.parse(activity.skills) : activity.skills
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get pending activities error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve pending activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/faculty/review/:id
// @desc    Review an activity (approve/reject)
// @access  Private (Faculty and Admin only)
router.post('/review/:id', [
  authenticateToken,
  authorizeRoles('faculty', 'admin'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { action, feedback } = req.body
    const activityId = req.params.id

    // Check if activity exists and is pending
    const activityCheck = await pool.query(
      'SELECT id, status, user_id, title FROM activities WHERE id = $1',
      [activityId]
    )

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    const activity = activityCheck.rows[0]

    if (activity.status !== 'pending') {
      return res.status(400).json({
        message: 'Activity is not pending review'
      })
    }

    const status = action === 'approve' ? 'approved' : 'rejected'

    const result = await pool.query(
      `UPDATE activities 
       SET status = $1, verified_by = $2, verification_date = CURRENT_TIMESTAMP, feedback = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, title, status, verification_date`,
      [status, req.user.id, feedback || null, activityId]
    )

    res.json({
      message: `Activity ${action}d successfully`,
      activity: result.rows[0]
    })
  } catch (error) {
    console.error('Review activity error:', error.message)
    res.status(500).json({
      message: 'Failed to review activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/faculty/my-reviews
// @desc    Get activities reviewed by current faculty member
// @access  Private (Faculty and Admin only)
router.get('/my-reviews', [
  authenticateToken,
  authorizeRoles('faculty', 'admin')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT a.*, u.name as student_name, u.email as student_email, u.student_id
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.verified_by = $1
    `
    const queryParams = [req.user.id]
    let paramCount = 1

    if (status && status !== 'all') {
      query += ` AND a.status = $${++paramCount}`
      queryParams.push(status)
    }

    query += ` ORDER BY a.verification_date DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM activities WHERE verified_by = $1'
    const countParams = [req.user.id]
    
    if (status && status !== 'all') {
      countQuery += ' AND status = $2'
      countParams.push(status)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalCount = parseInt(countResult.rows[0].count)

    res.json({
      activities: result.rows.map(activity => ({
        ...activity,
        skills: typeof activity.skills === 'string' ? JSON.parse(activity.skills) : activity.skills
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get my reviews error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve reviewed activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/faculty/stats
// @desc    Get faculty review statistics
// @access  Private (Faculty and Admin only)
router.get('/stats', [
  authenticateToken,
  authorizeRoles('faculty', 'admin')
], async (req, res) => {
  try {
    // Get overall statistics
    const overallStats = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reviews,
        COUNT(CASE WHEN verified_by = $1 THEN 1 END) as total_reviewed,
        COUNT(CASE WHEN verified_by = $1 AND status = 'approved' THEN 1 END) as approved_by_me,
        COUNT(CASE WHEN verified_by = $1 AND status = 'rejected' THEN 1 END) as rejected_by_me
       FROM activities`,
      [req.user.id]
    )

    // Get category breakdown for pending activities
    const categoryStats = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM activities 
       WHERE status = 'pending'
       GROUP BY category
       ORDER BY count DESC`
    )

    // Get recent activity
    const recentActivity = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as submissions
       FROM activities
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`
    )

    const stats = overallStats.rows[0]

    res.json({
      stats: {
        pendingReviews: parseInt(stats.pending_reviews),
        totalReviewed: parseInt(stats.total_reviewed),
        approvedByMe: parseInt(stats.approved_by_me),
        rejectedByMe: parseInt(stats.rejected_by_me)
      },
      categoryBreakdown: categoryStats.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count)
      })),
      recentActivity: recentActivity.rows.map(row => ({
        date: row.date,
        submissions: parseInt(row.submissions)
      }))
    })
  } catch (error) {
    console.error('Get faculty stats error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/faculty/student-activities/:studentId
// @desc    Get all activities for a specific student
// @access  Private (Faculty and Admin only)
router.get('/student-activities/:studentId', [
  authenticateToken,
  authorizeRoles('faculty', 'admin')
], async (req, res) => {
  try {
    const { studentId } = req.params
    const { status } = req.query

    let query = `
      SELECT a.*, u.name as student_name, u.email as student_email, u.student_id, u.department,
             v.name as verified_by_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verified_by = v.id
      WHERE u.student_id = $1
    `
    const queryParams = [studentId]
    let paramCount = 1

    if (status && status !== 'all') {
      query += ` AND a.status = $${++paramCount}`
      queryParams.push(status)
    }

    query += ' ORDER BY a.created_at DESC'

    const result = await pool.query(query, queryParams)

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'No activities found for this student'
      })
    }

    res.json({
      activities: result.rows.map(activity => ({
        ...activity,
        skills: typeof activity.skills === 'string' ? JSON.parse(activity.skills) : activity.skills
      }))
    })
  } catch (error) {
    console.error('Get student activities error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve student activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/faculty/review/:id
// @desc    Update review feedback
// @access  Private (Faculty and Admin only)
router.put('/review/:id', [
  authenticateToken,
  authorizeRoles('faculty', 'admin'),
  body('feedback').trim().isLength({ max: 500 }).withMessage('Feedback must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { feedback } = req.body
    const activityId = req.params.id

    // Check if activity was reviewed by current user
    const activityCheck = await pool.query(
      'SELECT id, status, verified_by FROM activities WHERE id = $1',
      [activityId]
    )

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    const activity = activityCheck.rows[0]

    if (activity.verified_by !== req.user.id) {
      return res.status(403).json({
        message: 'You can only update your own reviews'
      })
    }

    if (activity.status === 'pending') {
      return res.status(400).json({
        message: 'Cannot update feedback for pending activities'
      })
    }

    const result = await pool.query(
      `UPDATE activities 
       SET feedback = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, feedback, updated_at`,
      [feedback, activityId]
    )

    res.json({
      message: 'Review feedback updated successfully',
      activity: result.rows[0]
    })
  } catch (error) {
    console.error('Update review feedback error:', error.message)
    res.status(500).json({
      message: 'Failed to update review feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router