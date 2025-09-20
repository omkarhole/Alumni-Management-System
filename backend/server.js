const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();
const app=express();

const PORT=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



//routes
app.get('/',(req,res)=>{
    res.send('server is running fine ');
})



app.listen(PORT,()=>{
    console.log(`server is running on port :${PORT}`);
})