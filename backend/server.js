// Must be required before any async route handlers to catch async errors
require('express-async-errors');

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


dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

/* =========================
   CORS SETUP (MERGE RESOLVED)
========================= */

const normalizeOrigin = (origin = '') =>
    origin.trim().replace(/\/+$/, '');

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'https://alumni-management-system-frontend.onrender.com',
    'https://alumni-management-system-xi.vercel.app'
];

const ENV_ORIGINS = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || '')
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean)
];

const CLIENT_ORIGINS = [...new Set(
    [...DEFAULT_ORIGINS, ...ENV_ORIGINS]
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean)
)];

console.log('Allowed CORS origins:', CLIENT_ORIGINS);
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

app.use(express.json());
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

app.use('/auth', authRouter);
app.use('/api/oauth', oauthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/student', authenticate, studentRouter);
app.use('/api/contact', contactRouter);
app.use('/api/dm', directMessageRouter);
app.use('/api/business', businessRouter);
app.use('/api/courses', courseRouter);
app.use('/api/event-calendar', eventCalendarRouter);
app.use('/api/reunions', reunionRouter);
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
    origin: CLIENT_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket event handlers
initializeSocket(io);

server.listen(PORT, () => {
    logger.logInfo(`Server is running on port: ${PORT}`, { 
        environment: process.env.NODE_ENV,
        websocket: 'enabled'
    });
    logger.logInfo('WebSocket enabled via Socket.IO', { transports: ['websocket', 'polling'] });
});
