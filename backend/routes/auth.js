import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('studentId').trim().notEmpty().withMessage('Student/Employee ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, studentId, department, role } = req.body

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR student_id = $2',
      [email, studentId]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'User with this email or student ID already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id, department) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role, student_id, department`,
      [name, email, hashedPassword, role, studentId, department]
    )

    const user = result.rows[0]

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        department: user.department
      }
    })
  } catch (error) {
    console.error('Registration error:', error.message)
    res.status(500).json({
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user
    const result = await pool.query(
      'SELECT id, name, email, password, role, student_id, department FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const user = result.rows[0]

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user.id)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        department: user.department
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, student_id, department, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Get user error:', error.message)
    res.status(500).json({
      message: 'Failed to get user information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, department } = req.body
    const updates = {}
    const values = [req.user.id]
    let paramCount = 1

    if (name) {
      updates.name = `name = $${++paramCount}`
      values.push(name)
    }

    if (department) {
      updates.department = `department = $${++paramCount}`
      values.push(department)
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update'
      })
    }

    const updateQuery = `
      UPDATE users 
      SET ${Object.values(updates).join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING id, name, email, role, student_id, department
    `

    const result = await pool.query(updateQuery, values)

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('Profile update error:', error.message)
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router