const { listUsers: listUsersService, updateUser: updateUserService, deleteUser: deleteUserService } = require('../services/userService');

// List all users
async function listUsers(req, res, next) {
    try {
        const users = await listUsersService();
        res.json(users);
    } catch (err) { next(err); }
}

// Update user details
async function updateUser(req, res, next) {
    try {
        await updateUserService(req.params.id, req.body);
        res.json({ message: 'User updated' });
    } catch (err) { next(err); }
}

// Delete a user
async function deleteUser(req, res, next) {
    try {
        await deleteUserService(req.params.id);
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