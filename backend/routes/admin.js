import express from 'express'
import { body, validationResult } from 'express-validator'
import pool from '../config/database.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/admin/stats
// @desc    Get comprehensive system statistics
// @access  Private (Admin only)
router.get('/stats', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    // Get user statistics
    const userStats = await pool.query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN role = 'faculty' THEN 1 END) as total_faculty,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admin
       FROM users`
    )

    // Get activity statistics
    const activityStats = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_activities,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_activities,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_activities,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN hours_spent END), 0) as total_approved_hours
       FROM activities`
    )

    // Get category breakdown
    const categoryStats = await pool.query(
      `SELECT category, 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
       FROM activities
       GROUP BY category
       ORDER BY total DESC`
    )

    // Get monthly activity trends (last 12 months)
    const monthlyTrends = await pool.query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as submissions,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approvals
       FROM activities
       WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month`
    )

    // Get top performing students (by approved hours)
    const topStudents = await pool.query(
      `SELECT u.name, u.student_id, u.department,
        COUNT(a.id) as activity_count,
        COALESCE(SUM(a.hours_spent), 0) as total_hours
       FROM users u
       LEFT JOIN activities a ON u.id = a.user_id AND a.status = 'approved'
       WHERE u.role = 'student'
       GROUP BY u.id, u.name, u.student_id, u.department
       ORDER BY total_hours DESC
       LIMIT 10`
    )

    // Get faculty review performance
    const facultyPerformance = await pool.query(
      `SELECT u.name, u.email,
        COUNT(a.id) as reviews_completed,
        COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approvals,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejections,
        AVG(EXTRACT(EPOCH FROM (a.verification_date - a.created_at))/3600)::NUMERIC(10,2) as avg_review_time_hours
       FROM users u
       LEFT JOIN activities a ON u.id = a.verified_by
       WHERE u.role = 'faculty'
       GROUP BY u.id, u.name, u.email
       ORDER BY reviews_completed DESC`
    )

    const users = userStats.rows[0]
    const activities = activityStats.rows[0]

    res.json({
      overview: {
        totalUsers: parseInt(users.total_users),
        totalStudents: parseInt(users.total_students),
        totalFaculty: parseInt(users.total_faculty),
        totalAdmin: parseInt(users.total_admin),
        totalActivities: parseInt(activities.total_activities),
        pendingActivities: parseInt(activities.pending_activities),
        approvedActivities: parseInt(activities.approved_activities),
        rejectedActivities: parseInt(activities.rejected_activities),
        totalApprovedHours: parseInt(activities.total_approved_hours)
      },
      categoryBreakdown: categoryStats.rows.map(row => ({
        category: row.category,
        total: parseInt(row.total),
        approved: parseInt(row.approved),
        pending: parseInt(row.pending),
        rejected: parseInt(row.rejected)
      })),
      monthlyTrends: monthlyTrends.rows.map(row => ({
        month: row.month,
        submissions: parseInt(row.submissions),
        approvals: parseInt(row.approvals)
      })),
      topStudents: topStudents.rows.map(row => ({
        name: row.name,
        studentId: row.student_id,
        department: row.department,
        activityCount: parseInt(row.activity_count),
        totalHours: parseInt(row.total_hours)
      })),
      facultyPerformance: facultyPerformance.rows.map(row => ({
        name: row.name,
        email: row.email,
        reviewsCompleted: parseInt(row.reviews_completed),
        approvals: parseInt(row.approvals),
        rejections: parseInt(row.rejections),
        avgReviewTimeHours: parseFloat(row.avg_review_time_hours) || 0
      }))
    })
  } catch (error) {
    console.error('Get admin stats error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get('/users', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10, search } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT id, name, email, student_id, role, department, created_at, is_active
      FROM users
      WHERE 1=1
    `
    const queryParams = []
    let paramCount = 0

    if (role && role !== 'all') {
      query += ` AND role = $${++paramCount}`
      queryParams.push(role)
    }

    if (department && department !== 'all') {
      query += ` AND department = $${++paramCount}`
      queryParams.push(department)
    }

    if (search) {
      query += ` AND (name ILIKE $${++paramCount} OR email ILIKE $${++paramCount} OR student_id ILIKE $${++paramCount})`
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1'
    const countParams = []
    let countParamCount = 0

    if (role && role !== 'all') {
      countQuery += ` AND role = $${++countParamCount}`
      countParams.push(role)
    }

    if (department && department !== 'all') {
      countQuery += ` AND department = $${++countParamCount}`
      countParams.push(department)
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${++countParamCount} OR email ILIKE $${++countParamCount} OR student_id ILIKE $${++countParamCount})`
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const countResult = await pool.query(countQuery, countParams)
    const totalCount = parseInt(countResult.rows[0].count)

    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Get users error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const userId = req.params.id

    // Prevent admin from deactivating themselves
    if (userId === req.user.id.toString()) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account'
      })
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, is_active, name, email FROM users WHERE id = $1',
      [userId]
    )

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const user = userCheck.rows[0]
    const newStatus = !user.is_active

    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, is_active',
      [newStatus, userId]
    )

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Toggle user status error:', error.message)
    res.status(500).json({
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/admin/activities
// @desc    Get all activities with advanced filtering
// @access  Private (Admin only)
router.get('/activities', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { 
      status, 
      category, 
      department, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10,
      search 
    } = req.query
    
    const offset = (page - 1) * limit

    let query = `
      SELECT a.*, 
             u.name as student_name, u.email as student_email, u.student_id, u.department,
             v.name as verified_by_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verified_by = v.id
      WHERE 1=1
    `
    const queryParams = []
    let paramCount = 0

    if (status && status !== 'all') {
      query += ` AND a.status = $${++paramCount}`
      queryParams.push(status)
    }

    if (category && category !== 'all') {
      query += ` AND a.category = $${++paramCount}`
      queryParams.push(category)
    }

    if (department && department !== 'all') {
      query += ` AND u.department = $${++paramCount}`
      queryParams.push(department)
    }

    if (startDate) {
      query += ` AND a.created_at >= $${++paramCount}`
      queryParams.push(startDate)
    }

    if (endDate) {
      query += ` AND a.created_at <= $${++paramCount}`
      queryParams.push(endDate)
    }

    if (search) {
      query += ` AND (a.title ILIKE $${++paramCount} OR a.description ILIKE $${++paramCount} OR u.name ILIKE $${++paramCount})`
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `
    const countParams = []
    let countParamCount = 0

    if (status && status !== 'all') {
      countQuery += ` AND a.status = $${++countParamCount}`
      countParams.push(status)
    }

    if (category && category !== 'all') {
      countQuery += ` AND a.category = $${++countParamCount}`
      countParams.push(category)
    }

    if (department && department !== 'all') {
      countQuery += ` AND u.department = $${++countParamCount}`
      countParams.push(department)
    }

    if (startDate) {
      countQuery += ` AND a.created_at >= $${++countParamCount}`
      countParams.push(startDate)
    }

    if (endDate) {
      countQuery += ` AND a.created_at <= $${++countParamCount}`
      countParams.push(endDate)
    }

    if (search) {
      countQuery += ` AND (a.title ILIKE $${++countParamCount} OR a.description ILIKE $${++countParamCount} OR u.name ILIKE $${++countParamCount})`
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
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
    console.error('Get admin activities error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   DELETE /api/admin/activities/:id
// @desc    Delete any activity (admin override)
// @access  Private (Admin only)
router.delete('/activities/:id', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const activityId = req.params.id

    // Check if activity exists
    const activityCheck = await pool.query(
      'SELECT id, title FROM activities WHERE id = $1',
      [activityId]
    )

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    await pool.query('DELETE FROM activities WHERE id = $1', [activityId])

    res.json({
      message: 'Activity deleted successfully'
    })
  } catch (error) {
    console.error('Delete activity error:', error.message)
    res.status(500).json({
      message: 'Failed to delete activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/admin/export/activities
// @desc    Export activities data as CSV
// @access  Private (Admin only)
router.get('/export/activities', [
  authenticateToken,
  authorizeRoles('admin')
], async (req, res) => {
  try {
    const { status, category, department, startDate, endDate } = req.query

    let query = `
      SELECT a.id, a.title, a.description, a.category, a.start_date, a.end_date,
             a.hours_spent, a.location, a.status, a.created_at, a.verification_date,
             a.feedback, u.name as student_name, u.email as student_email, 
             u.student_id, u.department, v.name as verified_by_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN users v ON a.verified_by = v.id
      WHERE 1=1
    `
    const queryParams = []
    let paramCount = 0

    if (status && status !== 'all') {
      query += ` AND a.status = $${++paramCount}`
      queryParams.push(status)
    }

    if (category && category !== 'all') {
      query += ` AND a.category = $${++paramCount}`
      queryParams.push(category)
    }

    if (department && department !== 'all') {
      query += ` AND u.department = $${++paramCount}`
      queryParams.push(department)
    }

    if (startDate) {
      query += ` AND a.created_at >= $${++paramCount}`
      queryParams.push(startDate)
    }

    if (endDate) {
      query += ` AND a.created_at <= $${++paramCount}`
      queryParams.push(endDate)
    }

    query += ' ORDER BY a.created_at DESC'

    const result = await pool.query(query, queryParams)

    // Convert to CSV format
    const headers = [
      'ID', 'Title', 'Description', 'Category', 'Start Date', 'End Date',
      'Hours Spent', 'Location', 'Status', 'Created At', 'Verification Date',
      'Feedback', 'Student Name', 'Student Email', 'Student ID', 'Department',
      'Verified By'
    ]

    let csv = headers.join(',') + '\n'
    
    result.rows.forEach(row => {
      const csvRow = [
        row.id,
        `"${row.title.replace(/"/g, '""')}"`,
        `"${row.description.replace(/"/g, '""')}"`,
        row.category,
        row.start_date,
        row.end_date || '',
        row.hours_spent,
        `"${(row.location || '').replace(/"/g, '""')}"`,
        row.status,
        row.created_at,
        row.verification_date || '',
        `"${(row.feedback || '').replace(/"/g, '""')}"`,
        `"${row.student_name.replace(/"/g, '""')}"`,
        row.student_email,
        row.student_id,
        row.department,
        `"${(row.verified_by_name || '').replace(/"/g, '""')}"`
      ]
      csv += csvRow.join(',') + '\n'
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=activities_export.csv')
    res.send(csv)
  } catch (error) {
    console.error('Export activities error:', error.message)
    res.status(500).json({
      message: 'Failed to export activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', [
  authenticateToken,
  authorizeRoles('admin'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  body('student_id').optional().trim(),
  body('department').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, role, student_id, department } = req.body

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR student_id = $2',
      [email, student_id]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'User with this email or student ID already exists'
      })
    }

    // Hash password
    const bcrypt = await import('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id, department) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role, student_id, department, created_at`,
      [name, email, hashedPassword, role, student_id || null, department || null]
    )

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Create user error:', error.message)
    res.status(500).json({
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router