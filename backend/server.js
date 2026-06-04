// Must be required before any async route handlers to catch async errors

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const morgan = require('morgan');
const { connectDB } = require('./utils/db');
const { initializeSocket } = require('./utils/socket');
const logger = require('./utils/logger');
const authRouter = require('./routes/auth.routes');
const oauthRouter = require('./routes/oauth.routes');
const adminRouter = require('./routes/admin.routes');
const studentRouter = require('./routes/student.routes');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const contactRouter = require('./routes/contact.routes'); // contact routes
const directMessageRouter = require('./routes/directMessage.routes');
const businessRouter = require('./routes/business.routes');
const badgeRouter = require('./routes/badge.routes');
const courseRouter = require('./routes/course.routes');
const eventCalendarRouter = require('./routes/eventCalendar.routes');
const reunionRouter = require('./routes/reunion.routes');
const referralRouter = require('./routes/referral.routes');
const savedRouter = require('./routes/saved.routes');
const notificationRouter = require('./routes/notification.routes');
const streamRouter = require('./routes/stream.routes');
const resumeAnalyzerRouter = require('./routes/resumeAnalyzer.routes');
const marketplaceRouter = require('./routes/marketplace.routes');
const pollRouter = require('./routes/poll.routes');
const { startOpportunityNotificationScanner } = require('./services/opportunityNotificationService');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

/* =========================
   CORS SETUP (MERGE RESOLVED)
========================= */

const normalizeOrigin = (origin = '') =>
    String(origin).trim().replace(/\/+$/, '');

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'https://alumni-management-system-frontend.onrender.com',
    'https://alumni-management-system-xi.vercel.app'
];

const parseOriginsEnv = () => {
    const single = process.env.FRONTEND_URL;
    const multipleRaw = process.env.FRONTEND_URLS;

    const multiple = typeof multipleRaw === 'string'
        ? multipleRaw.split(',')
        : [];

    return [single, ...multiple]
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean);
};

const CLIENT_ORIGINS = [...new Set(
    [...DEFAULT_ORIGINS, ...parseOriginsEnv()]
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean)
)];

if (process.env.NODE_ENV === 'development') {
    console.log('Allowed CORS origins:', CLIENT_ORIGINS);
}
logger.logInfo('Server initialized with logging system enabled');


const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests without origin (Postman, curl, health checks)
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);

        if (CLIENT_ORIGINS.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* =========================
   MIDDLEWARES
========================= */

// HTTP request logging with Morgan
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.logInfo(message.trim()),
    },
    skip: (req, res) => {
        // Skip logging 404s and health check requests
        return res.statusCode === 404 || req.path === '/';
    },
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

/* =========================
   STATIC ASSETS
========================= */

app.use('/public', express.static(path.join(process.cwd(), 'public')));

/* =========================
   ROUTES
========================= */

app.get('/', (req, res) => {
    res.send('Server is running fine');
});

/* =========================
   API V1 ROUTES (VERSIONED)
========================= */

// Auth routes (no version prefix for auth)
app.use('/auth', authRouter);

// Versioned API routes
app.use('/api/v1/oauth', oauthRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/student', authenticate, studentRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/dm', directMessageRouter);
app.use('/api/v1/business', businessRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/event-calendar', eventCalendarRouter);
app.use('/api/v1/reunions', reunionRouter);
app.use('/api/v1/referrals', referralRouter);
app.use('/api/v1/saved', savedRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/stream', streamRouter);
app.use('/api/v1/resume-analyzer', resumeAnalyzerRouter);
app.use('/api/v1/marketplace', marketplaceRouter);
app.use('/api/v1/polls', pollRouter);
app.use('/api/v1', badgeRouter);


/* Backward compatibility for old routes (deprecated) */
app.use('/api/oauth', oauthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', authenticate, studentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/dm', directMessageRouter);
app.use('/api/business', businessRouter);
app.use('/api/courses', courseRouter);
app.use('/api/event-calendar', eventCalendarRouter);
app.use('/api/reunions', reunionRouter);
app.use('/api/referrals', referralRouter);
app.use('/api/saved', savedRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/polls', pollRouter);
app.use('/api', badgeRouter);

/* =========================
   DEVELOPMENT TEST ROUTE (remove in production)
 ========================= */
if (process.env.NODE_ENV === 'development') {
    app.post('/test-route', (req, res) => {
        res.send("Test endpoint");
    });
}

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   START SERVER
 ========================= */
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: (origin, callback) => {
        // Socket.IO needs exact origin match; normalize to reduce intermittent failures
        if (!origin) return callback(null, true);

        const normalizedOrigin = normalizeOrigin(origin);

        if (CLIENT_ORIGINS.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.set('io', io);

startOpportunityNotificationScanner();

// Initialize socket event handlers
initializeSocket(io);

server.listen(PORT, () => {
    logger.logInfo(`Server is running on port: ${PORT}`, { 
        environment: process.env.NODE_ENV,
        websocket: 'enabled'
    });
    logger.logInfo('WebSocket enabled via Socket.IO', { transports: ['websocket', 'polling'] });
});
