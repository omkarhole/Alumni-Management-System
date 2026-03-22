const jwt=require('jsonwebtoken');
const { User, BlacklistedToken } = require('../models/Index');

async function authenticate(req,res,next){
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({error:'Unauthorized'});

    }
    try{
        const blockedToken = await BlacklistedToken.findOne({ token }).select('_id');
        if (blockedToken) {
            return res.status(401).json({ error: 'Invalid Token' });
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(401).json({error:'Invalid Token'});
    }
};

// Factory that returns a middleware checking the required role(s).
// The fetched user is cached on req.userData so subsequent middleware in the
// same request chain never hits the database a second time.
function checkUserRole(requiredRole) {
    return async (req, res, next) => {
        try {
            if (!req.userData) {
                const user = await User.findById(req.user.id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                req.userData = user;
            }

            const allowed = Array.isArray(requiredRole)
                ? requiredRole.includes(req.userData.type)
                : requiredRole === 'any' || req.userData.type === requiredRole;

            if (!allowed) {
                const roleLabel = Array.isArray(requiredRole)
                    ? requiredRole.join(' or ')
                    : requiredRole;
                return res.status(403).json({ error: `Access denied. ${roleLabel} only.` });
            }

            next();
        } catch (err) {
            return res.status(500).json({ error: 'Server error' });
        }
    };
}

const isAdmin = checkUserRole('admin');
const isAlumnus = checkUserRole('alumnus');
const isStudent = checkUserRole('student');
const canPostJobs = checkUserRole(['admin', 'alumnus']);
const protectRoute = authenticate;

module.exports = { authenticate, protectRoute, isAdmin, isAlumnus, isStudent, canPostJobs };