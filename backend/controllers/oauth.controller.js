const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Index');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

// Since we are using manual code flow, we must specify the exact callback URL
const getRedirectUri = () => {
    return process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/oauth/callback/google`;
};

const getFrontendUrl = () => {
    return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Ensure client secret is available if using manual flow
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
);

async function googleAuthRedirect(req, res, next) {
    try {
        const authorizeUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
            prompt: 'consent'
        });
        res.redirect(authorizeUrl);
    } catch (err) {
        next(err);
    }
}

// Google Auth Callback (Receives code from Google)
async function googleAuthCallback(req, res, next) {
    try {
        const { code } = req.query; // Code redirected from Google

        if (!code) {
            return res.status(400).json({ error: 'Missing Google authorization code' });
        }

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Verify the id_token to get user payload
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];

        const frontendUrl = getFrontendUrl();

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Existing user, log them in
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.cookie('token', token, cookieOptions);

            // Redirect back to frontend homepage (or dashboard) safely logged in
            return res.redirect(`${frontendUrl}/?login_success=true`);
        } else {
            // New user, generate a temporary token for signup completion
            const tempToken = jwt.sign(
                { email, name, picture },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Valid for 1 hour to complete signup
            );

            // Redirect to the frontend complete-signup page with details in params
            const completeSignupUrl = new URL(`${frontendUrl}/oauth/complete-signup`);
            completeSignupUrl.searchParams.append('tempToken', tempToken);
            completeSignupUrl.searchParams.append('email', email);
            completeSignupUrl.searchParams.append('name', name);
            if (picture) completeSignupUrl.searchParams.append('picture', picture);

            return res.redirect(completeSignupUrl.toString());
        }
    } catch (err) {
        console.error("Google Auth Error:", err);
        const frontendUrl = getFrontendUrl();
        res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
}

// Complete Signup (Handles account type and additional details)
async function googleCompleteSignup(req, res, next) {
    try {
        const { tempToken, userType, course_id, gender, batch, enrollment_year, current_year, roll_number } = req.body;

        if (!tempToken) {
            return res.status(400).json({ error: 'Missing temporary token' });
        }

        // Verify temp token
        let payload;
        try {
            payload = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Temporary token expired or invalid' });
        }

        const { email, name, picture } = payload;

        // Check again if user exists to prevent duplicate signups
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate a random secure password for oauth users
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashed = await bcrypt.hash(randomPassword, 10);

        if (userType === 'alumnus') {
            user = await User.create({
                name,
                email,
                password: hashed,
                type: userType,
                auto_generated_pass: '',
                alumnus_bio: {
                    gender: gender || 'male',
                    batch: batch || new Date().getFullYear(),
                    course: course_id,
                    connected_to: '',
                    avatar: picture || '',
                    status: 0
                }
            });
        } else if (userType === 'student') {
            if (!enrollment_year || enrollment_year < 1900 || enrollment_year > new Date().getFullYear()) {
                return res.status(400).json({ error: 'Invalid enrollment year' });
            }
            if (!current_year || current_year < 1 || current_year > 6) {
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
                auto_generated_pass: '',
                student_bio: {
                    gender: gender || 'male',
                    enrollment_year: enrollment_year || new Date().getFullYear(),
                    current_year: current_year,
                    course: course_id,
                    roll_number: roll_number || null,
                    avatar: picture || ''
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        // Automatically log them in
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, cookieOptions);

        res.json({
            signupStatus: true,
            loginStatus: true,
            message: "Signup and login successful",
            userId: user._id,
            userType: user.type,
            userName: user.name,
            isNewUser: false
        });

    } catch (err) {
        next(err);
    }
}

module.exports = {
    googleAuthRedirect,
    googleAuthCallback,
    googleCompleteSignup
};
