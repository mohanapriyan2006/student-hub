# Student Activity Records Management System - Backend

A comprehensive Node.js/Express.js backend API for managing student co-curricular activities in Higher Education Institutions.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (Student, Faculty, Admin)
- Password encryption using bcryptjs
- Protected routes with middleware validation

### 👨‍🎓 Student Features
- Activity submission with evidence file uploads
- Personal activity dashboard and statistics
- Activity editing (pending activities only)
- Skills tracking and categorization
- Activity history and status tracking

### 👩‍🏫 Faculty Features
- Activity verification portal
- Bulk review capabilities with filtering
- Review feedback and comments
- Faculty performance metrics
- Student activity oversight

### 👨‍💼 Admin Features
- Comprehensive system analytics
- User management with role assignments
- Advanced activity filtering and search
- Data export capabilities (CSV)
- System-wide statistics and reporting

### 📁 File Management
- Secure file upload handling with Multer
- File type validation and size limits
- Static file serving with caching
- Evidence document management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer middleware
- **Validation**: express-validator
- **Security**: Helmet.js, CORS, bcryptjs
- **Environment**: dotenv configuration

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password

### Activity Routes (`/api/activities`)
- `POST /submit` - Submit new activity
- `GET /my-activities` - Get user's activities
- `GET /my-stats` - Get activity statistics
- `GET /:id` - Get specific activity
- `PUT /:id` - Update activity
- `DELETE /:id` - Delete activity

### Faculty Routes (`/api/faculty`)
- `GET /pending-activities` - Get pending activities for review
- `POST /review/:id` - Approve/reject activity
- `GET /my-reviews` - Get reviewed activities
- `GET /stats` - Get faculty statistics
- `GET /student-activities/:studentId` - Get student's activities
- `PUT /review/:id` - Update review feedback

### Admin Routes (`/api/admin`)
- `GET /stats` - Get system statistics
- `GET /users` - Get all users with pagination
- `PUT /users/:id/toggle-status` - Toggle user status
- `GET /activities` - Get all activities with filters
- `DELETE /activities/:id` - Delete any activity
- `GET /export/activities` - Export activities as CSV
- `POST /users` - Create new user

### File Routes (`/api/files`)
- `GET /:filename` - Serve uploaded files

## Database Schema

### Users Table
- User authentication and profile information
- Role-based access control
- Department and student ID tracking

### Activities Table
- Complete activity submission data
- Status tracking (pending/approved/rejected)
- Evidence file references
- Verification timestamps and feedback

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database server
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-activity-SIH/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here_make_it_very_secure_and_long
   JWT_EXPIRES_IN=7d
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=student_activities
   DB_USER=postgres
   DB_PASSWORD=password
   UPLOAD_LIMIT=10MB
   ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
   ```

4. **Database Setup**
   
   Create PostgreSQL database:
   ```sql
   CREATE DATABASE student_activities;
   ```
   
   The application will automatically create tables and seed initial data on first run.

5. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

### Default Users

The system creates default users for testing:

**Admin User:**
- Email: admin@university.edu
- Password: admin123
- Role: Admin

**Faculty User:**
- Email: faculty@university.edu
- Password: faculty123
- Role: Faculty

**Student User:**
- Email: student@university.edu
- Password: student123
- Role: Student

## API Testing

### Health Check
```bash
GET http://localhost:5000/api/health
```

### Authentication Example
```bash
# Register new user
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "password123",
  "role": "student",
  "student_id": "2024001",
  "department": "Computer Science"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@university.edu",
  "password": "password123"
}
```

### Activity Submission Example
```bash
POST http://localhost:5000/api/activities/submit
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

# Form data:
title: "Hackathon Participation"
description: "Participated in 48-hour coding hackathon"
category: "Academic"
start_date: "2024-01-15"
end_date: "2024-01-17"
hours_spent: 48
location: "University Campus"
skills: ["JavaScript", "React", "Node.js"]
evidence_file: <file>
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Input Validation**: express-validator for all inputs
- **File Upload Security**: Type and size validation
- **CORS Protection**: Configured for development and production
- **Helmet.js**: Security headers middleware
- **Environment Variables**: Sensitive data protection

## Error Handling

The API implements comprehensive error handling:
- Validation errors with detailed field information
- Authentication and authorization errors
- Database connection and query errors
- File upload errors
- Generic server errors with environment-based details

## Performance Optimizations

- **Database Connection Pooling**: Efficient PostgreSQL connections
- **File Caching**: Static file serving with ETag support
- **Pagination**: Efficient data loading for large datasets
- **Indexing**: Optimized database queries with proper indexing

## Development Guidelines

### Code Structure
- Modular route organization
- Middleware separation
- Reusable validation schemas
- Error handling consistency

### Database Best Practices
- Prepared statements for SQL injection prevention
- Foreign key constraints for data integrity
- Proper indexing for query performance
- Transaction handling for data consistency

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use secure JWT secrets
   - Configure production database
   - Set up proper CORS origins

2. **Security Checklist**
   - Enable HTTPS
   - Set secure cookies
   - Configure rate limiting
   - Set up monitoring and logging
   - Regular security updates

3. **Database Migration**
   - Backup existing data
   - Run migrations in production
   - Verify data integrity
   - Monitor performance

## Monitoring and Maintenance

- **Logging**: Morgan HTTP request logging
- **Health Checks**: Built-in health endpoint
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Database query optimization

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Follow code style guidelines
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create GitHub issues for bugs
- Check documentation for API details
- Review code comments for implementation details