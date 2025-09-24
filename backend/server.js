const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const path=require('path');
const authRouter=require('./routes/auth.routes');
const adminRouter=require('./routes/admin.routes'); 
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error.middleware');
dotenv.config();
const app=express();


// cors setup 
const CLIENT_ORIGINS=[
    'http://localhost:5173'
    // add vercel api here
];

app.use(cors({ origin: CLIENT_ORIGINS, methods: ['GET','POST','PUT','PATCH','DELETE'], credentials: true }));
// app.options('/*', cors({ origin: CLIENT_ORIGINS, credentials: true }));


// middlewares build-in
app.use(express.json());
app.use(cookieParser());

//static assets
app.use('/api/admin/public',express.static(path.join(process.cwd(),'Public')));

//api routes - admin and auth
app.use('/auth',authRouter);
app.use('/api/admin',adminRouter);

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