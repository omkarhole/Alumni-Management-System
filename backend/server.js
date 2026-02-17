const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const path=require('path');
const { connectDB } = require('./utils/db');
const authRouter=require('./routes/auth.routes');
const adminRouter=require('./routes/admin.routes'); 
const studentRouter=require('./routes/student.routes');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error.middleware');
const { authenticate } = require('./middlewares/auth.middleware');
dotenv.config();
const app=express();

// Connect to MongoDB
connectDB();

// cors setup
const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '');

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'https://alumni-management-system-frontend.onrender.com'
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
        // Allow server-to-server/no-origin requests (curl, Postman, health checks).
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        if (CLIENT_ORIGINS.includes(normalizedOrigin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));


// middlewares build-in
app.use(express.json());
app.use(cookieParser());

//static assets
app.use('/public',express.static(path.join(process.cwd(),'public')));

//api routes - admin and auth (student,alumni,admin)
app.use('/auth',authRouter);
// admin routes 
app.use('/api/admin',adminRouter);
// student routes (with authentication)
app.use('/api/student', authenticate, studentRouter);

//routes
app.get('/',(req,res)=>{
    res.send('server is running fine ');
})

//404-error Handler
app.use((req,res)=>{
    res.status(404).json({error:'Route not found'});
})

//central error handler
app.use(errorHandler);

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on port :${PORT}`);
})
