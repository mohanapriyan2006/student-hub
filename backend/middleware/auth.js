import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database to ensure they still exist
    const result = await pool.query(
      'SELECT id, name, email, role, student_id, department FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Token verification error:', error.message)
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}

// Middleware to check user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      })
    }

    next()
  }
}

// Middleware to check if user owns the resource or has admin privileges
export const authorizeOwnershipOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  // Admin can access everything
  if (req.user.role === 'admin') {
    return next()
  }

  // For activities, check if user owns the activity
  if (req.params.id) {
    try {
      const result = await pool.query(
        'SELECT user_id FROM activities WHERE id = $1',
        [req.params.id]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Resource not found' })
      }

      if (result.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' })
      }
    } catch (error) {
      console.error('Authorization error:', error.message)
      return res.status(500).json({ message: 'Authorization check failed' })
    }
  }

  next()
}