const bcrypt = require('bcrypt');
const { User } = require('../models/Index');

// List all users
async function listUsers(req, res, next) {
    try {
        const users = await User.find().sort({ name: 1 }).populate('alumnus_bio.course');
        res.json(users);
    } catch (err) { next(err); }
}

// Update user details
async function updateUser(req, res, next) {
    try {
        const { name, email, type, password } = req.body;
        const updates = { name, email, type };
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }
        await User.findByIdAndUpdate(req.params.id, updates);
        res.json({ message: 'User updated' });
    } catch (err) { next(err); }
}

// Delete a user
async function deleteUser(req, res, next) {
    try {
        const id = req.params.id;
        // MongoDB will automatically delete embedded alumnus_bio with the user
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        next(err);
    }
}


module.exports = {
    listUsers,
    updateUser,
    deleteUser
};