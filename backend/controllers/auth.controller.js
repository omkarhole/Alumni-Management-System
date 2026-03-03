const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User, Otp } = require('../models/Index');
const sendEmail = require('../utils/mailer');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

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
        res.cookie('token', token, cookieOptions);

        // response object for admin
        const response = {
            loginStatus: true,
            userId: user._id,
            userType: user.type,
            userName: user.name,
            alumnus_id: user._id
        };
        // Add type-specific data to the response object if student or alumnus
        if (user.type === 'student' && user.student_bio) {
            response.student_bio = {
                gender: user.student_bio.gender,
                enrollment_year: user.student_bio.enrollment_year,
                current_year: user.student_bio.current_year,
                course: user.student_bio.course,
                roll_number: user.student_bio.roll_number,
                avatar: user.student_bio.avatar
            };
        } else if (user.type === 'alumnus' && user.alumnus_bio) {
            response.alumnus_bio = {
                gender: user.alumnus_bio.gender,
                batch: user.alumnus_bio.batch,
                course: user.alumnus_bio.course,
                status: user.alumnus_bio.status,
                avatar: user.alumnus_bio.avatar
            };
        }
        res.json(response);
    } catch (err) {
        next(err);
    }
}

// return current authenticated session user
async function session(req, res, next) {
    try {
        const user = await User.findById(req.user.id).select('_id name email type');
        if (!user) {
            return res.status(401).json({ authenticated: false, error: 'Unauthorized' });
        }

        res.json({
            authenticated: true,
            userId: user._id,
            userType: user.type,
            userName: user.name,
            email: user.email
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
        // added alumnus signup
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
        // added student signup
        else if (userType === 'student') {

            // VALIDATION CHECKS
            if (!req.body.enrollment_year || req.body.enrollment_year < 1900 || req.body.enrollment_year > new Date().getFullYear()) {
                return res.status(400).json({ error: 'Invalid enrollment year' });
            }

            if (!req.body.current_year || req.body.current_year < 1 || req.body.current_year > 6) {
                return res.status(400).json({ error: 'Current year must be between 1 and 6' });
            }

            if (!course_id) {
                return res.status(400).json({ error: 'Course is required for students' });
            }
            user = await User.create({
                name,
                email,
                password: hashed,
                type: userType,
                student_bio: {
                    gender: req.body.gender || 'male',
                    enrollment_year: req.body.enrollment_year || new Date().getFullYear(),
                    course: course_id,
                    roll_number: req.body.roll_number || null,
                    avatar: ''
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
    res.clearCookie('token', {
        httpOnly: true,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
    });
    res.json({ message: 'Logout Successful' });
}

// Request password reset (Forgot Password)
async function requestPasswordReset(req, res, next) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User with this email does not exist' });
        }

        // Generate a 6 digit OTP
        const otpGenerator = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to the database, first delete any existing OTP for this user to avoid conflicts
        await Otp.deleteMany({ email });
        await Otp.create({ email, otp: otpGenerator });

        // Send OTP via email
        const html = `
            <h2>Password Reset</h2>
            <p>Your OTP for password reset is: <strong>${otpGenerator}</strong></p>
            <p>This OTP is valid for 5 minutes. Please do not share this with anyone.</p>
        `;
        await sendEmail(email, "Password Reset OTP", html);

        return res.json({ success: true, message: 'OTP sent successfully to your email' });
    } catch (error) {
        next(error);
    }
}

// Verify OTP
async function verifyOtp(req, res, next) {
    try {
        const { email, otp } = req.body;

        const existingOtp = await Otp.findOne({ email, otp });
        if (!existingOtp) {
            return res.json({ success: false, message: 'Invalid or expired OTP' });
        }

        return res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        next(error);
    }
}

// Reset Password
async function resetPassword(req, res, next) {
    try {
        const { email, otp, newPassword } = req.body;

        // Final verification of OTP
        const existingOtp = await Otp.findOne({ email, otp });
        if (!existingOtp) {
            return res.json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const hashedPassword = await bycrypt.hash(newPassword, 10);

        // Update user password
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        // Delete the used OTP
        await Otp.deleteMany({ email });

        return res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
}

module.exports = { login, signup, logout, session, requestPasswordReset, verifyOtp, resetPassword };
