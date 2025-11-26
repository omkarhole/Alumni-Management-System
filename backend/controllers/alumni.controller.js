const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/Index');
const path = require('path');


// print alumnilist
async function alumniList(req, res, next) {
    try {
        const list = await User.find({ type: 'alumnus' })
            .populate('alumnus_bio.course')
            .sort({ name: 1 });
        res.json(list);
    } catch (err) {
        next(err);
    }
}

// print alumnus by id
async function alumnus(req, res, next) {
    try {
        const record = await User.findById(req.params.id).populate('alumnus_bio.course');
        res.json(record);
    } catch (err) {
        next(err);
    }
}

// update alumnus status
async function updateAlumnusStatus(req, res, next) {
    try {
        await User.findByIdAndUpdate(
            req.body.id,
            { 'alumnus_bio.status': req.body.status }
        );
        res.json({ message: 'Status updated' });
    } catch (err) {
        next(err);
    }
}

// delete alumnus
async function deleteAlumnus(req, res, next) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
}


// update account with avatar upload
async function updateAccount(req, res, next) {
    console.log("update acccccccccc");
    try {
        console.log("SERVER");
        const userId = req.body.user_id;

        // Build user update payload
        const userData = {
            name: req.body.name,
            email: req.body.email,
            'alumnus_bio.gender': req.body.gender,
            'alumnus_bio.batch': req.body.batch,
            'alumnus_bio.course': req.body.course_id,
            'alumnus_bio.connected_to': req.body.connected_to,
        };
        
        if (req.file) {
            const fullPath = req.file.path;
            const relPath = path.relative(process.cwd(), fullPath);
            userData['alumnus_bio.avatar'] = relPath.replace(/\\/g, '/');
        }

        if (req.body.password) {
            const hashed = await bcrypt.hash(req.body.password, 10);
            userData.password = hashed;
        }

        // Update user
        await User.findByIdAndUpdate(userId, userData);

        res.json({ message: 'Account updated successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports={
    alumniList,
    alumnus,
    updateAlumnusStatus,
    deleteAlumnus,
    updateAccount
}
