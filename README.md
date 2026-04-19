# 🎓 Alumni Management System

A comprehensive web application to manage alumni connections, events, job postings, and foster community engagement.

## 📑 Table of Contents

- [About](#-about)
- [Use Cases](#-use-cases)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Environment Setup](#environment-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [Contributors](#-contributors)
 
## 📖 About

The Alumni Management System is a full-stack web application designed to help educational institutions maintain strong relationships with their graduates. It bridges the gap between alumni and their alma mater by providing a centralized platform for networking, career development, and community engagement.

### 🎯 Target Users

- **Educational Institutions** - Schools, colleges, and universities looking to maintain alumni relations
- **Alumni** - Graduates seeking networking opportunities, career resources, and community connection
- **Students** - Current students looking for mentorship and job opportunities
- **Administrators** - Staff managing alumni data, events, and platform content

### 💡 Use Cases

- **Alumni Networking** - Connect graduates across different batches and courses
- **Career Development** - Post and apply for job opportunities within the alumni community
- **Event Management** - Organize reunions, webinars, and networking events
- **Knowledge Sharing** - Forum discussions for mentorship and advice
- **Institutional Updates** - Share news, achievements, and announcements

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - Modern UI library with hooks and functional components
- ⚡ **Vite** - Fast build tool and development server
- 🎨 **Tailwind CSS** - Utility-first CSS framework for responsive design
- 🔄 **React Router DOM** - Client-side routing
- 📱 **Bootstrap 5** - Additional UI components
- 🔔 **React Toastify** - Notification system

### Backend
- 🟢 **Node.js** - JavaScript runtime environment
- 🚀 **Express.js** - Web application framework
- 🍃 **MongoDB** - NoSQL document database
- 🗂️ **Mongoose** - MongoDB object modeling
- 🔐 **JWT** - JSON Web Token authentication
- 📁 **Multer** - File upload handling
- 🛡️ **Bcrypt** - Password hashing

### Development Tools
- 📦 **npm** - Package management
- 🔄 **Nodemon** - Development auto-restart
- 🔍 **ESLint** - Code linting
- 📝 **Prettier** - Code formatting

## ✨ Features

### 🔐 Authentication & Authorization
- Secure user registration and login
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin, Alumni, Student)

### 👥 User Management
- Alumni directory with search and filter capabilities
- User profiles with professional information
- Account management and settings

### 📅 Events Management
- Create, edit, and manage alumni events
- Event registration and attendance tracking
- Calendar view of upcoming events

### 💼 Career Portal
- Job posting and application system
- Resume/CV upload functionality
- Application tracking for employers and applicants

### 💬 Community Features
- Forum discussions with topic creation
- Comment system for engagement
- Gallery for event photos and memories

### ⚙️ Admin Dashboard
- Comprehensive analytics and statistics
- User management and moderation
- Content management system
- System settings configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Included with Node.js
- **MongoDB** (v6.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
  - Or use **MongoDB Atlas** (Cloud) - [Free tier available](https://www.mongodb.com/cloud/atlas)

### Optional Tools
- **Git** - For cloning the repository
- **MongoDB Compass** - GUI for MongoDB (recommended)
- **VS Code** - Recommended IDE with extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code

### Verify Installation
```bash
node --version    # Should show v18.0.0 or higher
npm --version     # Should show v9.0.0 or higher
mongod --version  # Should show v6.0 or higher (if using local MongoDB)
```

## 📁 Project Structure

```
Alumni-Management-System/
├── 📂 backend/                 # Node.js + Express backend
│   ├── 📂 config/             # Configuration files
│   │   └── config.js          # Database configuration
│   ├── 📂 controllers/        # Route controllers
│   │   ├── auth.controller.js
│   │   ├── oauth.controller.js
│   │   ├── user.controller.js
│   │   ├── alumni.controller.js
│   │   ├── event.controller.js
│   │   ├── career.controller.js
│   │   ├── forum.controller.js
│   │   ├── gallery.controller.js
│   │   ├── settings.controller.js
│   │   └── dashboard.controller.js
│   ├── 📂 models/             # Mongoose models
│   │   ├── User.model.js
│   │   ├── Course.model.js
│   │   ├── Career.model.js
│   │   ├── Event.model.js
│   │   ├── ForumTopic.model.js
│   │   ├── Gallery.model.js
│   │   └── SystemSetting.model.js
│   ├── 📂 middlewares/        # Express middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── 📂 routes/             # API routes
│   ├── 📂 utils/              # Utility functions
│   ├── 📂 public/             # Static files (avatars, images)
│   ├── server.js              # Main server entry point
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables (create this)
│
├── 📂 frontend/               # React + Vite frontend
│   ├── 📂 src/
│   │   ├── 📂 components/    # React components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── About.jsx
│   │   │   ├── AlumniList.jsx
│   │   │   ├── Careers.jsx
│   │   │   ├── Forum.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── MyAccount.jsx
│   │   │   └── manage/       # Management components
│   │   ├── 📂 admin/         # Admin panel components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminAlumni.jsx
│   │   │   ├── AdminEvents.jsx
│   │   │   ├── AdminJobs.jsx
│   │   │   ├── AdminForum.jsx
│   │   │   ├── AdminGallery.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── 📂 students/      # Student portal components
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentHome.jsx
│   │   │   ├── StudentEvents.jsx
│   │   │   ├── StudentJobs.jsx
│   │   │   ├── StudentForum.jsx
│   │   │   └── StudentProfile.jsx
│   │   ├── 📂 assets/        # Static assets (images, CSS)
│   │   ├── 📂 utils/         # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   ├── AuthContext.jsx   # Authentication context
│   │   ├── ThemeContext.jsx  # Theme context
│   │   └── main.jsx          # Entry point
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # Tailwind CSS configuration
│
└── README.md                 # This file
```

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run the project locally.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Alumni-Management-System
```

### Step 2: Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add the following environment variables to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/alumni_management
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: Cloud image storage (avatars + gallery)
# If these are not set, uploads are stored locally under backend/public
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
# CLOUDINARY_FOLDER=alumni-management-system

# Optional: Email Configuration (for future email features)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Optional: Google Oauth
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

**Important:** Replace `your_super_secret_jwt_key_change_this_in_production` with a strong, random string for JWT signing.

#### Frontend Environment Variables (Optional)

If you need to configure the API URL, create a `.env` file in the `frontend/` directory:

```bash
cd frontend
touch .env  # On Windows: type nul > .env
```

Add to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (if using local MongoDB)
# On Windows: net start MongoDB
# On macOS/Linux: sudo systemctl start mongod

# Start the development server
npm run dev
# Or for production: npm start
```

The backend server will start on `http://localhost:5000`

**Verify Backend is Running:**
- Open browser: `http://localhost:5000`
- You should see: "server is running fine"

### Step 4: Frontend Setup

Open a new terminal window/tab:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

**Access the Application:**
- Open browser: `http://localhost:5173`
- Default admin credentials (if seeded): Check migration data or create new account

### Step 5: Verify Installation

Test the following endpoints and features:

1. **Homepage** - `http://localhost:5173` loads without errors
2. **Login** - Can access login page and authenticate
3. **Admin Panel** - Access admin dashboard at `/admin`
4. **API Health** - `http://localhost:5000` returns success message

## 📚 API Documentation

The backend exposes RESTful APIs. Key endpoints include:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout

### Admin APIs
- `GET /api/admin/users` - Get all users
- `GET /api/admin/alumni` - Get alumni directory
- `GET /api/admin/events` - Get events
- `GET /api/admin/careers` - Get job postings
- `GET /api/admin/forums` - Get forum topics
- `GET /api/admin/dashboard/counts` - Get dashboard statistics

### Student APIs
- `GET /api/student/profile` - Get student profile
- `GET /api/student/events` - Get student events
- `GET /api/student/jobs` - Get available jobs

For detailed API documentation, refer to `backend/API_CHANGES.md` and `backend/QUICK_START.md`.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can contribute:

### Getting Started
1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork: `git clone https://github.com/your-username/Alumni-Management-System.git`

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix-name
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add comments where necessary
   - Update README if needed

4. **Test Your Changes**
   ```bash
   # Run backend tests (if available)
   cd backend && npm test
   
   # Run frontend linting
   cd frontend && npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   # or
   git commit -m "fix: resolve bug description"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Go to GitHub and create a Pull Request
   - Describe your changes in detail
   - Link any related issues

### Code Style Guidelines

- **JavaScript/React**: Follow ESLint configuration
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for functions
- **Commits**: Use conventional commit messages (feat:, fix:, docs:, style:, refactor:, test:, chore:)

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, etc.)

## 🛠️ Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Error: MongoDB connection failed
```
**Solution:**
- Ensure MongoDB is running: `mongod --version`
- Check your `MONGODB_URI` in `.env`
- Verify network access (for Atlas)

#### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:**
- Change the PORT in `.env` file: `PORT=5001`
- Or kill the process using port 5000

#### CORS Errors
```
Access to fetch at 'http://localhost:5000/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/server.js`

#### Module Not Found Errors
```
Error: Cannot find module 'xyz'
```
**Solution:**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

#### Frontend Not Loading
- Check if backend is running
- Verify API URL in frontend configuration
- Check browser console for errors

### Getting Help

- 📖 Check `backend/QUICK_START.md` for migration details
- 📖 Check `backend/API_CHANGES.md` for API updates
- 🐛 Create an issue on GitHub
- 💬 Contact the contributors

## 👨‍💻 Contributors

- **Omkar** - Backend Development & Database Architecture
- **Priyanshu** - Frontend Development & UI/UX Design
- **Ashad** - API Development & Authentication
- **Vedant** - Testing & Documentation

---

## 📄 License

This project is licensed under the ISC License.

---

Made with ❤️ by the Alumni Management System Team

**Happy Coding! 🚀**
