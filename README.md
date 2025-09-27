# Student Activity Records Management System

A comprehensive full-stack web application for managing student co-curricular activities in Higher Education Institutions (HEI). This system enables students to log their activities, faculty to verify submissions, and administrators to generate insights and reports.

## 🎯 Project Overview

This Student Activity Records Management System addresses the critical need for systematic tracking and verification of student co-curricular activities in higher education institutions. It provides a digital platform that streamlines the entire process from activity submission to transcript generation.

### Key Objectives
- **Digitize Activity Tracking**: Replace manual record-keeping with an automated digital system
- **Standardize Verification**: Implement consistent verification processes across all activities
- **Generate Comprehensive Reports**: Create detailed activity transcripts and analytics
- **Improve Institutional Insights**: Provide data-driven insights for institutional decision-making

## ✨ Features

### 👨‍🎓 Student Portal
- **Activity Submission**: Submit activities with evidence files and detailed descriptions
- **Real-time Tracking**: Monitor submission status (pending, approved, rejected)
- **Personal Dashboard**: View activity statistics and progress tracking
- **Skills Portfolio**: Track and categorize skills developed through activities
- **Digital Transcript**: Generate comprehensive activity transcripts in PDF format

### 👩‍🏫 Faculty Portal
- **Verification Dashboard**: Review and verify student activity submissions
- **Bulk Processing**: Efficiently process multiple submissions with filtering options
- **Feedback System**: Provide detailed feedback and comments on submissions
- **Performance Analytics**: Track verification statistics and trends
- **Student Oversight**: Monitor individual student activity profiles

### 👨‍💼 Admin Dashboard
- **System Analytics**: Comprehensive insights into platform usage and trends
- **User Management**: Manage student, faculty, and admin accounts
- **Data Export**: Export activity data for institutional reporting
- **Advanced Filtering**: Search and filter activities across multiple dimensions
- **Performance Monitoring**: Track system performance and user engagement

### 🔒 Security & Authentication
- **Role-based Access**: Secure access control for different user types
- **JWT Authentication**: Secure token-based authentication system
- **Data Protection**: Encrypted password storage and secure file handling
- **Session Management**: Automatic token refresh and secure logout

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2.0 with modern hooks
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with consistent design language
- **State Management**: React Context API for global state
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF + html2canvas for transcript generation
- **HTTP Client**: Axios for API communication

### Backend
- **Runtime**: Node.js 18+ with ES modules
- **Framework**: Express.js with modern middleware
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT tokens with bcryptjs password hashing
- **File Upload**: Multer middleware with validation
- **Validation**: express-validator for input sanitization
- **Security**: Helmet.js, CORS, rate limiting
- **Logging**: Morgan for HTTP request logging

### Database
- **Primary Database**: PostgreSQL 14+
- **Schema Design**: Normalized tables with proper relationships
- **Indexing**: Optimized queries with strategic indexing
- **Data Integrity**: Foreign key constraints and validation
- **Backup Strategy**: Automated backup and recovery procedures

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 14.0 or higher
- **npm**: Package manager (comes with Node.js)
- **Git**: Version control system

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd student-activity-SIH
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   
   # Start the backend server
   npm run dev
   ```

3. **Database Setup**
   ```sql
   -- Create PostgreSQL database
   CREATE DATABASE student_activities;
   ```
   
   The application will automatically create tables and seed initial data.

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your API URL
   
   # Start the development server
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

### Default Test Accounts

The system creates default accounts for testing:

**Admin Account:**
- Email: admin@university.edu
- Password: admin123

**Faculty Account:**
- Email: faculty@university.edu
- Password: faculty123

**Student Account:**
- Email: student@university.edu
- Password: student123

## 📁 Project Structure

```
student-activity-SIH/
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── Student/      # Student portal components
│   │   │   ├── Faculty/      # Faculty portal components
│   │   │   ├── Admin/        # Admin dashboard components
│   │   │   ├── Common/       # Shared components
│   │   │   └── Layout/       # Layout components
│   │   ├── context/          # React context providers
│   │   ├── services/         # API service layer
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
│
├── backend/                   # Node.js backend API
│   ├── config/               # Configuration files
│   ├── middleware/           # Express middleware
│   ├── routes/               # API route handlers
│   ├── uploads/              # File upload directory
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
│
└── README.md                 # Project documentation
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_activities
DB_USER=postgres
DB_PASSWORD=password
UPLOAD_LIMIT=10MB
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Student Activity Records
VITE_APP_VERSION=1.0.0
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Activity Management
- `POST /api/activities/submit` - Submit new activity
- `GET /api/activities/my-activities` - Get user's activities
- `GET /api/activities/my-stats` - Get activity statistics

### Faculty Operations
- `GET /api/faculty/pending-activities` - Get activities for review
- `POST /api/faculty/review/:id` - Approve/reject activity
- `GET /api/faculty/stats` - Get faculty statistics

### Admin Functions
- `GET /api/admin/stats` - Get system analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/activities` - Get all activities
- `GET /api/admin/export/activities` - Export data as CSV

## 🎨 UI/UX Design

### Design Principles
- **User-Centric**: Intuitive interfaces designed for different user roles
- **Responsive**: Mobile-first design with cross-device compatibility
- **Accessible**: WCAG 2.1 AA compliance for accessibility
- **Consistent**: Unified design language across all components
- **Modern**: Clean, professional aesthetics suitable for academic environments

### Color Palette
- **Primary**: Blue (#2563eb) - Trust, professionalism
- **Secondary**: Green (#059669) - Success, approval
- **Accent**: Purple (#7c3aed) - Analytics, insights
- **Warning**: Orange (#ea580c) - Attention, pending
- **Error**: Red (#dc2626) - Rejection, errors
- **Neutral**: Gray scale for text and backgrounds

## 🔐 Security Measures

### Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (RBAC) for different user types
- Password hashing using bcryptjs with salt rounds
- Session management with automatic token refresh

### Data Protection
- Input validation and sanitization on all endpoints
- SQL injection prevention with parameterized queries
- File upload validation with type and size restrictions
- CORS configuration for cross-origin request security

### Infrastructure Security
- Environment variable management for sensitive data
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Secure file serving with access controls

## 📈 Performance Optimization

### Frontend Performance
- Code splitting and lazy loading for optimal bundle size
- Memoization of expensive components and calculations
- Efficient state management with React Context
- Optimized images and asset compression

### Backend Performance
- Database connection pooling for efficient resource usage
- Query optimization with proper indexing
- Caching strategies for frequently accessed data
- Pagination for large datasets

### Database Optimization
- Strategic indexing on frequently queried columns
- Normalized schema design for data integrity
- Query optimization with EXPLAIN analysis
- Regular maintenance and performance monitoring

## 🚀 Deployment

### Development Environment
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Build frontend for production
cd frontend && npm run build

# Start production server
cd backend && npm start
```

## 🤝 Contributing

### Development Workflow
1. **Fork the Repository**: Create your own copy of the project
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Follow Code Standards**: Maintain consistent code style
4. **Write Tests**: Add tests for new functionality
5. **Submit Pull Request**: Detailed description of changes

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for Higher Education Institutions**

*Empowering students, faculty, and administrators with comprehensive activity tracking and verification capabilities.*