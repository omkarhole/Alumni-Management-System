const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./utils/db');
const authRouter = require('./routes/auth.routes');
const adminRouter = require('./routes/admin.routes');
const studentRouter = require('./routes/student.routes');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
const contactRouter = require('./routes/contact.routes'); // contact routes

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
app.use('/api/admin', adminRouter);
app.use('/api/student', authenticate, studentRouter);
app.use('/api/contact', contactRouter);

/* =========================
   TEST ROUTE
 ========================= */
app.post('/direct-test', (req, res) => {
    res.send("DIRECT POST WORKING");
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
