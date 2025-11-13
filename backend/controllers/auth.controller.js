const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models/index');

//login controller
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ loginStatus: false, Error: 'Invalid Credentials' });
        }
        const match = await bycrypt.compare(password, user.password);
        if (!match) {
            return res.json({ loginStatus: false, Error: 'Invalid Credentials' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true });

        res.json({
            loginStatus: true,
            userId: user._id,
            userType: user.type,
            userName: user.name,
            alumnus_id: user._id
        });
    } catch (err) {
        next(err);
    }
}

//signup controller
async function signup(req, res, next) {
    try {
        const { name, email, password, userType, course_id } = req.body;
        //check for existing email
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ email: existing.email });
        }
        const hashed = await bycrypt.hash(password, 10);
        let user;
        if (userType === 'alumnus') {
            user = await User.create({ 
                name, 
                email, 
                password: hashed, 
                type: userType,
                alumnus_bio: {
                    gender: req.body.gender || 'male',
                    batch: req.body.batch || new Date().getFullYear(),
                    course: course_id,
                    connected_to: '',
                    avatar: '',
                    status: 0
                }
            });
        }
        else {
            user = await User.create({ name, email, password: hashed, type: userType });
        }
        res.json({ message: "Signup Scuccessful", userId: user._id, signupStatus: true });
    }
    catch (err) {
        next(err);
    }
}
//logout controller
function logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Logout Successful' });
}


module.exports = { login, signup, logout };