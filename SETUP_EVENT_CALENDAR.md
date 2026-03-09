# Event Calendar & RSVP System - Quick Setup Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Backend and Frontend servers running

## Backend Setup (Already Complete)

### 1. Verify Files
All required files have been created:
```
✅ backend/models/EventCalendar.model.js
✅ backend/controllers/eventCalendar.controller.js
✅ backend/routes/eventCalendar.routes.js
✅ Updated: backend/models/Index.js
✅ Updated: backend/server.js
```

### 2. Start Backend Server
```bash
cd backend
npm install  # If not already installed
npm start    # or: node server.js
```

Backend will be available at: `http://localhost:5000`

API endpoints available:
- `GET /api/event-calendar` - All events
- `GET /api/event-calendar/calendar-view?month=4&year=2026`
- `POST /api/event-calendar` - Create event (admin)

---

## Frontend Setup

### 1. Verify Files
All required files have been created:
```
✅ frontend/src/components/EventCalendar.jsx
✅ frontend/src/components/EventDetails.jsx
✅ frontend/src/components/MyEvents.jsx
✅ frontend/src/styles/EventCalendar.css
✅ frontend/src/styles/EventDetails.css
✅ frontend/src/styles/MyEvents.css
```

### 2. Update App.jsx (or your main routing file)

Add these imports:
```jsx
import EventCalendar from './components/EventCalendar';
import EventDetails from './components/EventDetails';
import MyEvents from './components/MyEvents';
```

Add these routes inside your `<Routes>` component:
```jsx
<Route path="/events" element={<EventCalendar />} />
<Route path="/event/:eventId" element={<EventDetails />} />
<Route path="/my-events" element={<MyEvents />} />
```

### 3. Update Navigation

Add links to your Header/Navigation component:
```jsx
<Link to="/events">📅 Events Calendar</Link>
<Link to="/my-events">📌 My Events</Link>
```

### 4. Start Frontend Server
```bash
cd frontend
npm install  # If not already installed
npm run dev  # Start development server
```

Frontend will be available at: `http://localhost:5173`

---

## Testing the Feature

### Test 1: View Events Calendar
1. Navigate to `http://localhost:5173/events`
2. Should see calendar grid with current month
3. Try changing month using left/right arrows
4. Test filters (Event Type, Event Mode)

### Test 2: Create an Event (Admin)
1. Make POST request to create event:
```bash
curl -X POST http://localhost:5000/api/event-calendar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Alumni Reunion",
    "description": "Annual class reunion dinner",
    "eventType": "reunion",
    "startDate": "2026-06-15T18:00:00Z",
    "endDate": "2026-06-15T21:00:00Z",
    "eventMode": "in-person",
    "location": "Hotel Grand Ballroom",
    "capacity": 150,
    "rsvpDeadline": "2026-06-10T23:59:59Z",
    "eventTags": ["2024-batch", "celebration"]
  }'
```

2. Or use Postman/Insomnia with the same data

### Test 3: View Event Details
1. From `/events`, click on an event
2. Should navigate to `/event/:id`
3. View full event info including:
   - Event type badge
   - Date and time
   - Location or virtual link
   - Attendee count
   - RSVP button

### Test 4: RSVP to Event
1. On event details page, select number of guests
2. Click "RSVP to Event" button
3. If event is full, should show "Join Waitlist"
4. Success notification should appear

### Test 5: View My Events
1. After RSVPing, navigate to `/my-events`
2. Should see the event(s) you RSVPed to
3. Try different filters:
   - Upcoming
   - Past
   - Confirmed
   - Waitlist

### Test 6: Cancel RSVP
1. From `/my-events`, click trash icon on an event
2. Confirm cancellation
3. Event should be removed from list
4. If someone was on waitlist, they should be promoted

---

## Troubleshooting

### Issue: Components not rendering
**Solution:** 
- Check browser console for errors
- Verify imports in App.jsx
- Ensure routes are correctly configured

### Issue: API errors (404 or 500)
**Solution:**
- Verify backend server is running on port 5000
- Check that all backend files were created
- Check MongoDB connection
- Check backend console for error messages

### Issue: RSVP button disabled
**Solution:**
- Check if user is authenticated
- Verify RSVP deadline hasn't passed
- Check if already RSVPed to event
- Check event capacity

### Issue: Styling looks wrong
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend dev server
- Verify CSS files are in `frontend/src/styles/`
- Check for CSS import conflicts

---

## API Documentation

### GET Events with Filters
```
GET /api/event-calendar?eventType=workshop&eventMode=virtual&tags=professional
```

Parameters:
- `eventType` - workshop|reunion|networking|webinar|social
- `eventMode` - in-person|virtual|hybrid
- `tags` - comma-separated tags
- `month` & `year` - filter by month

### POST RSVP
```
POST /api/event-calendar/rsvp
Authorization: Bearer <token>

{
  "eventId": "...",
  "numberOfGuests": 2
}
```

### GET My RSVPs
```
GET /api/event-calendar/my-rsvps?status=confirmed
Authorization: Bearer <token>
```

Parameters:
- `status` - all|confirmed|waitlist

---

## Database Schema

### EventCalendar Collection
```json
{
  "_id": ObjectId,
  "title": String,
  "description": String,
  "eventType": String,
  "startDate": Date,
  "endDate": Date,
  "eventMode": String,
  "location": String,
  "virtualLink": String,
  "capacity": Number,
  "rsvpDeadline": Date,
  "eventTags": [String],
  "organizer": ObjectId,
  "rsvps": [
    {
      "alumni": ObjectId,
      "status": String,
      "rsvpDate": Date,
      "numberOfGuests": Number
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## Features Summary

✅ Calendar view by month
✅ Event filtering by type and mode
✅ Event details page
✅ RSVP system with capacity management
✅ Automatic waitlisting
✅ User's events dashboard
✅ Event sharing
✅ Virtual meeting links
✅ Responsive design
✅ Admin event management

---

## Next Steps (Optional)

1. **Add Email Notifications**
   - Install `nodemailer`
   - Send RSVP confirmations

2. **Event Images**
   - Integrate with Cloudinary
   - Add banner upload

3. **Search & Advanced Filtering**
   - Add search bar
   - Filter by date range
   - Sort options

4. **Analytics**
   - Track RSVPs
   - Event attendance stats
   - Popular events

---

## Performance Tips

- Events are indexed by date, type, tags
- Pagination can be added for large event lists
- Consider caching calendar data
- Virtual scrolling for large attendee lists

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review component source code comments
3. Check backend console for API errors
4. Verify MongoDB indexes are created

---

## Rollback (If Needed)

If you need to remove this feature:
1. Delete created files (models, controllers, routes, components, styles)
2. Remove from `backend/models/Index.js`
3. Remove from `backend/server.js`
4. Remove router middleware line
5. Remove from `frontend/App.jsx` routes
6. Remove navigation links

---

**Feature Implementation Complete!** 🎉

You now have a fully functional Alumni Events Calendar & RSVP System ready to use.
