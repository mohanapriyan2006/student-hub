import express from 'express'
import multer from 'multer'
import path from 'path'
import { body, validationResult } from 'express-validator'
import pool from '../config/database.js'
import { authenticateToken, authorizeRoles, authorizeOwnershipOrAdmin } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'))
    }
  }
})

// @route   POST /api/activities/submit
// @desc    Submit a new activity
// @access  Private (Students only)
router.post('/submit', [
  authenticateToken,
  authorizeRoles('student'),
  upload.single('evidence_file'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['Leadership', 'Volunteering', 'Sports', 'Arts', 'Research', 'Clubs', 'Events', 'Academic']).withMessage('Invalid category'),
  body('start_date').isDate().withMessage('Invalid start date'),
  body('hours_spent').isInt({ min: 1 }).withMessage('Hours spent must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const {
      title,
      description,
      category,
      start_date,
      end_date,
      hours_spent,
      location,
      skills
    } = req.body

    // Parse skills if it's a JSON string
    let parsedSkills = []
    if (skills) {
      try {
        parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills
      } catch (e) {
        parsedSkills = []
      }
    }

    const evidenceUrl = req.file ? `/api/files/${req.file.filename}` : null

    const result = await pool.query(
      `INSERT INTO activities 
       (user_id, title, description, category, start_date, end_date, hours_spent, location, skills, evidence_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, title, status, created_at`,
      [
        req.user.id,
        title,
        description,
        category,
        start_date,
        end_date || null,
        parseInt(hours_spent),
        location || null,
        JSON.stringify(parsedSkills),
        evidenceUrl
      ]
    )

    res.status(201).json({
      message: 'Activity submitted successfully',
      activity: result.rows[0]
    })
  } catch (error) {
    console.error('Activity submission error:', error.message)
    res.status(500).json({
      message: 'Failed to submit activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/activities/my-activities
// @desc    Get current user's activities
// @access  Private (Students only)
router.get('/my-activities', [
  authenticateToken,
  authorizeRoles('student')
], async (req, res) => {
  try {
    const { status, category } = req.query

    let query = `
      SELECT a.*, u.name as verified_by_name
      FROM activities a
      LEFT JOIN users u ON a.verified_by = u.id
      WHERE a.user_id = $1
    `
    const queryParams = [req.user.id]
    let paramCount = 1

    if (status && status !== 'all') {
      query += ` AND a.status = $${++paramCount}`
      queryParams.push(status)
    }

    if (category && category !== 'all') {
      query += ` AND a.category = $${++paramCount}`
      queryParams.push(category)
    }

    query += ' ORDER BY a.created_at DESC'

    const result = await pool.query(query, queryParams)

    res.json({
      activities: result.rows.map(activity => ({
        ...activity,
        skills: typeof activity.skills === 'string' ? JSON.parse(activity.skills) : activity.skills
      }))
    })
  } catch (error) {
    console.error('Get activities error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/activities/my-stats
// @desc    Get current user's activity statistics
// @access  Private (Students only)
router.get('/my-stats', [
  authenticateToken,
  authorizeRoles('student')
], async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_activities,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_activities,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_activities,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN hours_spent END), 0) as total_hours
       FROM activities 
       WHERE user_id = $1`,
      [req.user.id]
    )

    const stats = result.rows[0]

    res.json({
      stats: {
        totalActivities: parseInt(stats.total_activities),
        approvedActivities: parseInt(stats.approved_activities),
        pendingActivities: parseInt(stats.pending_activities),
        rejectedActivities: parseInt(stats.rejected_activities),
        totalHours: parseInt(stats.total_hours)
      }
    })
  } catch (error) {
    console.error('Get stats error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/activities/:id
// @desc    Get a specific activity
// @access  Private (Owner or Admin/Faculty)
router.get('/:id', [
  authenticateToken,
  authorizeOwnershipOrAdmin
], async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as student_name, u.email as student_email, u.student_id,
              v.name as verified_by_name
       FROM activities a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN users v ON a.verified_by = v.id
       WHERE a.id = $1`,
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    const activity = result.rows[0]
    activity.skills = typeof activity.skills === 'string' ? JSON.parse(activity.skills) : activity.skills

    res.json({
      activity
    })
  } catch (error) {
    console.error('Get activity error:', error.message)
    res.status(500).json({
      message: 'Failed to retrieve activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/activities/:id
// @desc    Update an activity
// @access  Private (Owner only, and only if status is pending)
router.put('/:id', [
  authenticateToken,
  authorizeRoles('student'),
  upload.single('evidence_file'),
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').optional().isIn(['Leadership', 'Volunteering', 'Sports', 'Arts', 'Research', 'Clubs', 'Events', 'Academic']).withMessage('Invalid category'),
  body('hours_spent').optional().isInt({ min: 1 }).withMessage('Hours spent must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    // Check if activity exists and belongs to user
    const activityCheck = await pool.query(
      'SELECT id, status, user_id FROM activities WHERE id = $1',
      [req.params.id]
    )

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    const activity = activityCheck.rows[0]

    if (activity.user_id !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied'
      })
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({
        message: 'Can only edit pending activities'
      })
    }

    const {
      title,
      description,
      category,
      start_date,
      end_date,
      hours_spent,
      location,
      skills
    } = req.body

    // Build update query dynamically
    const updates = []
    const values = [req.params.id]
    let paramCount = 1

    if (title) {
      updates.push(`title = $${++paramCount}`)
      values.push(title)
    }

    if (description) {
      updates.push(`description = $${++paramCount}`)
      values.push(description)
    }

    if (category) {
      updates.push(`category = $${++paramCount}`)
      values.push(category)
    }

    if (start_date) {
      updates.push(`start_date = $${++paramCount}`)
      values.push(start_date)
    }

    if (end_date !== undefined) {
      updates.push(`end_date = $${++paramCount}`)
      values.push(end_date || null)
    }

    if (hours_spent) {
      updates.push(`hours_spent = $${++paramCount}`)
      values.push(parseInt(hours_spent))
    }

    if (location !== undefined) {
      updates.push(`location = $${++paramCount}`)
      values.push(location || null)
    }

    if (skills) {
      let parsedSkills = []
      try {
        parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills
      } catch (e) {
        parsedSkills = []
      }
      updates.push(`skills = $${++paramCount}`)
      values.push(JSON.stringify(parsedSkills))
    }

    if (req.file) {
      updates.push(`evidence_url = $${++paramCount}`)
      values.push(`/api/files/${req.file.filename}`)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update'
      })
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')

    const updateQuery = `
      UPDATE activities 
      SET ${updates.join(', ')}
      WHERE id = $1 
      RETURNING *
    `

    const result = await pool.query(updateQuery, values)

    res.json({
      message: 'Activity updated successfully',
      activity: result.rows[0]
    })
  } catch (error) {
    console.error('Update activity error:', error.message)
    res.status(500).json({
      message: 'Failed to update activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   DELETE /api/activities/:id
// @desc    Delete an activity
// @access  Private (Owner only, and only if status is pending)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles('student')
], async (req, res) => {
  try {
    // Check if activity exists and belongs to user
    const activityCheck = await pool.query(
      'SELECT id, status, user_id FROM activities WHERE id = $1',
      [req.params.id]
    )

    if (activityCheck.rows.length === 0) {
      return res.status(404).json({
        message: 'Activity not found'
      })
    }

    const activity = activityCheck.rows[0]

    if (activity.user_id !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied'
      })
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({
        message: 'Can only delete pending activities'
      })
    }

    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id])

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

export default router