const jwt=require('jsonwebtoken');
const { User } = require('../models/Index');

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

// Middleware to check if user is admin
async function isAdmin(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.type !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

// Middleware to check if user is alumnus
async function isAlumnus(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.type !== 'alumnus') {
            return res.status(403).json({ error: 'Access denied. Alumni only.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

// Middleware to check if user is student
async function isStudent(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.type !== 'student') {
            return res.status(403).json({ error: 'Access denied. Students only.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

// Middleware to check if user can post jobs (admin or alumnus)
async function canPostJobs(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || (user.type !== 'admin' && user.type !== 'alumnus')) {
            return res.status(403).json({ error: 'Access denied. Only admin and alumni can post jobs.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { authenticate, isAdmin, isAlumnus, isStudent, canPostJobs };