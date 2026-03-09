# Learning Portal - Quick Start Guide

## 🚀 Quick Setup (30 minutes)

### Backend ✅ DONE
All backend code is complete and integrated. No additional action needed.

### Frontend - 3 Steps to Activate

#### Step 1: Add Routes
Edit your main route file (App.jsx or routes.jsx):

```jsx
import CourseCatalog from './components/CourseCatalog';
import CourseDetails from './components/CourseDetails';
import CoursePlayer from './components/CoursePlayer';
import MyLearning from './components/MyLearning';
import CreateCourse from './components/CreateCourse';
import PrivateRoute from './components/PrivateRoute'; // Your existing component

// Inside your BrowserRouter/Routes component:
<Route path="/courses" element={<CourseCatalog />} />
<Route path="/course/:courseId" element={<CourseDetails />} />
<Route path="/course-player/:enrollmentId" element={<CoursePlayer />} />
<Route path="/my-learning" element={<MyLearning />} />
<Route path="/create-course" element={<PrivateRoute><CreateCourse /></PrivateRoute>} />
```

#### Step 2: Add Navigation Links
Edit your Header component:

```jsx
<nav>
  {/* ... existing links ... */}
  <Link to="/courses" className="...">Learning</Link>
  {user && <Link to="/my-learning" className="...">My Learning</Link>}
  {user?.isInstructor && <Link to="/create-course" className="...">Create Course</Link>}
</nav>
```

#### Step 3: Test It!
```bash
# Terminal
npm start

# In browser
# Go to: http://localhost:5173/courses
```

---

## 📱 User Flows

### Student Journey
1. Visit `/courses` → Browse courses
2. Search/filter by category
3. Click course → View `/course/:courseId`
4. Click "Enroll Now"
5. Go to `/my-learning`
6. Click "Continue Learning" → `/course-player/:enrollmentId`
7. Complete lessons → Take quiz
8. Course 100% complete → Download certificate
9. View stats at `/my-learning`

### Instructor Journey
1. Click "Create Course" → `/create-course`
2. Fill course details, add modules, lessons
3. Click "Save Course"
4. Course saved in draft status
5. View in instructor dashboard → Edit/Publish

---

## 🔧 API Endpoints (for testing)

### Create Test Data
```bash
# Create a course (replace TOKEN with your auth token)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "description": "Learn JavaScript fundamentals",
    "category": "Web Development",
    "level": "beginner",
    "isFree": true,
    "modules": []
  }'
```

### Get Courses
```bash
# Public - Get all courses
curl http://localhost:5000/api/courses

# With filters
curl http://localhost:5000/api/courses?category=Web%20Development&level=beginner
```

### User Learning
```bash
# Get my courses (requires auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/courses/my-learning/list

# Get stats (requires auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/courses/my-learning/stats
```

---

## 🎨 Customization

### Colors/Theme
All components use Tailwind CSS. Modify in component JSX:
- Blue primary: `bg-blue-600` → change to `bg-purple-600`
- Green success: `bg-green-600` → change to `bg-teal-600`

### Styling
- Dark mode: Automatically handled by `useTheme()` - no changes needed
- Responsive: Mobile-first Tailwind breakpoints (sm:, md:, lg:)

### Component Props
Each component accepts context props:
- `user` from `useAuth()`
- `isDark` from `useTheme()`

---

## 🧪 Testing

### Test Student Enrollment
1. Create course (instructor)
2. Publish course
3. Go to `/courses` (new browser tab or incognito)
4. Enroll in course
5. Check `/my-learning`
6. View progress

### Test Quiz
1. Create lesson with quiz
2. Enroll in course
3. Go to CoursePlayer
4. Answer quiz questions
5. View score

### Test Certificate
1. Complete all lessons
2. Course progress reaches 100%
3. Generate certificate
4. Download/view

---

## 🐛 Troubleshooting

### Course Not Showing
**Problem**: Created course doesn't appear in catalog
```javascript
// Check if published:
// In MongoDB console:
db.courses.findOne({_id: courseId}) // Check isPublished: true
```

**Fix**: Publish the course via API:
```bash
curl -X POST http://localhost:5000/api/courses/{courseId}/publish \
  -H "Authorization: Bearer TOKEN"
```

### Enrollment Fails
**Problem**: Can't enroll in course
```
Check: 
1. User is logged in
2. Course ID is correct
3. User not already enrolled
```

### Quiz Not Grading
**Problem**: Quiz shows no score
```
Check:
1. Quiz has questions defined
2. correctAnswer matches answer format (case-sensitive)
3. User submitted quiz
```

---

## 📊 Database Quick Reference

### Collections
```
courses          - Course catalog
enrollments      - Student progress
users            - User accounts (existing)
```

### Key Queries
```javascript
// Get all published courses
db.courses.find({ isPublished: true })

// Get student enrollments
db.enrollments.find({ user: userId })

// Get course with high enrollment
db.courses.find({ enrollmentCount: { $gt: 10 } })
```

---

## 📦 File Structure

```
backend/
  models/
    ✅ Course.model.js (Updated)
    ✅ Enrollment.model.js (NEW)
    ✅ Index.js (Updated)
  controllers/
    ✅ course.controller.js (Updated)
  routes/
    ✅ course.routes.js (Updated)
  ✅ server.js (Updated)

frontend/src/components/
  ✅ CourseCatalog.jsx (NEW)
  ✅ CourseDetails.jsx (NEW)
  ✅ CoursePlayer.jsx (NEW)
  ✅ MyLearning.jsx (NEW)
  ✅ CreateCourse.jsx (NEW)
```

---

## ⚡ Performance Tips

1. **Pagination**: Default 10 items per page (adjust in controller)
2. **Images**: Use thumbnails (compress images before uploading)
3. **Videos**: Host on CDN (YouTube embed or MP4 link)
4. **Caching**: Add Redis for enrollment queries

---

## 🔐 Security Notes

✅ All post/put routes require authentication
✅ Authorization checks on user resources
✅ Validation on all inputs
✅ XSS protection via React
✅ CSRF protection recommended (add middleware)

---

## 📝 Component Props Reference

### CourseCatalog
```jsx
// No props required
// Uses: useTheme(), useNavigate(), useSearchParams()
<CourseCatalog />
```

### CourseDetails
```jsx
// Route: /course/:courseId
// Uses: courseId from params
<CourseDetails />
```

### CoursePlayer
```jsx
// Route: /course-player/:enrollmentId
// Uses: enrollmentId from params, useAuth()
<CoursePlayer />
```

### MyLearning
```jsx
// No props required
// Uses: useAuth(), useTheme(), useNavigate()
<MyLearning />
```

### CreateCourse
```jsx
// Route: /create-course (protected)
// Uses: useAuth(), useTheme(), useNavigate()
<CreateCourse />
```

---

## 🎯 Next Steps

1. **✅ Add 5 routes** to your routing file (5 min)
2. **✅ Add navigation links** in Header (5 min)
3. **✅ Test by creating a course** (5 min)
4. **✅ Test enrollment flow** (10 min)
5. **Optional**: Create InstructorCourses component (20 min)
6. **Optional**: Add payment integration (1-2 hours)
7. **Optional**: Certificate PDF generation (1 hour)

---

## 📞 Support

For detailed information, see:
- [LEARNING_PORTAL_GUIDE.md](./LEARNING_PORTAL_GUIDE.md) - Full documentation
- [LEARNING_PORTAL_SUMMARY.md](./LEARNING_PORTAL_SUMMARY.md) - Implementation summary

---

## ✨ You're Ready!

Your Learning & Certification Portal is ready to go live. Just add the 5 routes and you're done! 🎉

**Total Setup Time**: ~30 minutes
**Difficulty**: Easy
**Status**: **READY TO DEPLOY** ✅
