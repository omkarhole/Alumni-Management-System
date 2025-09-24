const jwt=require('jsonwebtoken');

function authenticate(req,res,next){
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({error:'Unauthorized'});

    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(401).json({error:'Invalid Token'});
    }
};

module.exports=authenticate;