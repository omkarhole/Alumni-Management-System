# API Response Changes - MySQL vs MongoDB

## User Object

### Before (MySQL + Sequelize)
```json
{
  "id": 1,
  "name": "Junaid Rana",
  "email": "admin@gmail.com",
  "password": "$2b$10$...",
  "type": "admin",
  "auto_generated_pass": "",
  "alumnus_id": 0
}
```

### After (MongoDB + Mongoose)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Junaid Rana",
  "email": "admin@gmail.com",
  "password": "$2b$10$...",
  "type": "admin",
  "auto_generated_pass": "",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Alumnus User (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Meet Devin",
  "email": "alumnus@gmail.com",
  "type": "alumnus",
  "alumnus_bio": {
    "gender": "male",
    "batch": 2022,
    "course": "507f1f77bcf86cd799439013",
    "connected_to": "Microsoft dev",
    "avatar": "Public/Avatar/image.jpg",
    "status": 1
  },
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## Event Object

### Before (MySQL)
```json
{
  "id": 1,
  "title": "Sports Gala Event",
  "content": "<p>Event details...</p>",
  "schedule": "2024-09-18T02:51:00.000Z",
  "banner": "",
  "date_created": "2024-02-01T14:52:54.000Z",
  "commits": [
    {
      "id": 12,
      "event_id": 1,
      "user_id": 2
    },
    {
      "id": 13,
      "event_id": 1,
      "user_id": 1
    }
  ]
}
```

### After (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "title": "Sports Gala Event",
  "content": "<p>Event details...</p>",
  "schedule": "2024-09-18T02:51:00.000Z",
  "banner": "",
  "commits": [
    {
      "user": "507f1f77bcf86cd799439012"
    },
    {
      "user": "507f1f77bcf86cd799439011"
    }
  ],
  "createdAt": "2024-02-01T14:52:54.000Z",
  "updatedAt": "2024-02-01T14:52:54.000Z"
}
```

---

## Forum Topic Object

### Before (MySQL)
```json
{
  "id": 4,
  "title": "Lorem Ipsum Topic",
  "description": "<p>Topic description...</p>",
  "user_id": 1,
  "date_created": "2020-10-16T08:31:45.000Z",
  "user": {
    "name": "Junaid Rana"
  }
}
```

### After (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439030",
  "title": "Lorem Ipsum Topic",
  "description": "<p>Topic description...</p>",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Junaid Rana"
  },
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "comment": "wow great... Hello world",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Meet Devin"
      },
      "createdAt": "2024-03-07T12:51:48.000Z"
    }
  ],
  "createdAt": "2020-10-16T08:31:45.000Z",
  "updatedAt": "2024-03-07T12:51:48.000Z"
}
```

---

## Career/Job Object

### Before (MySQL)
```json
{
  "id": 1,
  "company": "IT Company",
  "location": "Remote",
  "job_title": "Web Developer",
  "description": "<p>Job description...</p>",
  "user_id": 1,
  "date_created": "2020-10-15T14:14:27.000Z",
  "user": {
    "name": "Junaid Rana"
  }
}
```

### After (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439040",
  "company": "IT Company",
  "location": "Remote",
  "job_title": "Web Developer",
  "description": "<p>Job description...</p>",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Junaid Rana"
  },
  "createdAt": "2020-10-15T14:14:27.000Z",
  "updatedAt": "2020-10-15T14:14:27.000Z"
}
```

---

## Course Object

### Before (MySQL)
```json
{
  "id": 1,
  "course": "BSC",
  "about": ""
}
```

### After (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "course": "BSC",
  "about": "",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Gallery Object

### Before (MySQL)
```json
{
  "id": 1,
  "image_path": "Public\\Images\\2_img.jpg",
  "about": "Gallery img...",
  "created": "2024-02-15T20:48:55.000Z"
}
```

### After (MongoDB)
```json
{
  "_id": "507f1f77bcf86cd799439050",
  "image_path": "Public\\Images\\2_img.jpg",
  "about": "Gallery img...",
  "createdAt": "2024-02-15T20:48:55.000Z",
  "updatedAt": "2024-02-15T20:48:55.000Z"
}
```

---

## Dashboard Counts

### Same Response Structure ✅
```json
{
  "forums": 5,
  "jobs": 10,
  "events": 8,
  "upevents": 3,
  "alumni": 25
}
```

---

## Frontend Update Checklist

### Required Changes:
1. ✅ Change `id` to `_id` in all API calls
2. ✅ Update user object structure (embedded `alumnus_bio`)
3. ✅ Handle ObjectId strings (24-character hex)
4. ✅ Update comments access (now embedded in topics)
5. ✅ Update event commits (now embedded in events)

### Example Frontend Updates:

```javascript
// Before (MySQL)
const userId = user.id;
const alumnusId = user.alumnus_id;

// After (MongoDB)
const userId = user._id;
const alumnusBio = user.alumnus_bio; // Embedded object
const courseId = user.alumnus_bio?.course;
```

```javascript
// Before (MySQL) - Separate API call for comments
GET /api/admin/forum/comments/:topicId

// After (MongoDB) - Comments are in topic
GET /api/admin/forum/:topicId
// Response includes comments array
```

---

## Authentication Token

### JWT Payload Change:
```javascript
// Before (MySQL)
{
  id: 1,
  email: "user@example.com"
}

// After (MongoDB)
{
  id: "507f1f77bcf86cd799439011", // Now ObjectId string
  email: "user@example.com"
}
```

---

## Notes

1. **ObjectId Format**: MongoDB IDs are 24-character hexadecimal strings
2. **Timestamps**: All models now have `createdAt` and `updatedAt`
3. **Embedded Data**: Some related data is now nested (alumnus_bio, comments, commits)
4. **Population**: Use `.populate()` to get referenced documents (like course details)

---

## Testing Endpoints

After migration, test these key endpoints:

```bash
# Auth
POST /auth/login
POST /auth/signup
POST /auth/logout

# Users
GET /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id

# Alumni
GET /api/admin/alumni
GET /api/admin/alumni/:id
PUT /api/admin/alumni/status

# Courses
GET /api/admin/courses
POST /api/admin/courses
PUT /api/admin/courses/:id
DELETE /api/admin/courses/:id

# Careers
GET /api/admin/careers
POST /api/admin/careers
PUT /api/admin/careers/:id
DELETE /api/admin/careers/:id

# Events
GET /api/admin/events
POST /api/admin/events
PUT /api/admin/events/:id
DELETE /api/admin/events/:id
POST /api/admin/events/participate

# Forums
GET /api/admin/forums
POST /api/admin/forums
GET /api/admin/forums/:topicId/comments
POST /api/admin/forums/:topicId/comments

# Gallery
GET /api/admin/gallery
POST /api/admin/gallery
DELETE /api/admin/gallery/:id

# Dashboard
GET /api/admin/dashboard/counts
```
