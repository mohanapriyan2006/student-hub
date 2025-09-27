import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'student_activities',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

// Create connection pool
const pool = new Pool(dbConfig)

// Test database connection
pool.on('connect', () => {
  console.log('🐘 Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('💥 Database connection error:', err.message)
  process.exit(-1)
})

// Database initialization script
export const initializeDatabase = async () => {
  const client = await pool.connect()
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        student_id VARCHAR(50),
        department VARCHAR(255),
        year VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        hours_spent INTEGER NOT NULL,
        location VARCHAR(255),
        skills JSONB DEFAULT '[]',
        evidence_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        comments TEXT,
        verified_by INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
      CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)

    // Insert default admin user if not exists
    const adminExists = await client.query(
      "SELECT id FROM users WHERE email = 'admin@university.edu'"
    )

    if (adminExists.rows.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.default.hash('password123', 12)
      
      await client.query(`
        INSERT INTO users (name, email, password, role, student_id, department)
        VALUES 
        ('Admin User', 'admin@university.edu', $1, 'admin', 'ADMIN001', 'Administration'),
        ('Dr. Sarah Johnson', 'faculty@university.edu', $1, 'faculty', 'FAC001', 'Computer Science'),
        ('John Doe', 'student@university.edu', $1, 'student', 'CS2024001', 'Computer Science')
      `, [hashedPassword])
      
      console.log('✅ Default users created')
    }

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error.message)
    throw error
  } finally {
    client.release()
  }
}

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})

export default pool