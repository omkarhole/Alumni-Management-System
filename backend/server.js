const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const path=require('path');
const errorHandler = require('./middlewares/error.middleware');
dotenv.config();
const app=express();

const PORT=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


//static assets
app.use('/api/admin/public',express.static(path.join(process.cwd(),'Public')));

//api routes - temporarily commented until routes are created
// app.use('/auth',authRouter);
// app.use('/api/admin',adminRouter);

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

app.listen(PORT,()=>{
    console.log(`server is running on port :${PORT}`);
})