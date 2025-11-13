const express=require('express');
const multer=require('multer');

const {avatarUpload}=require('../utils/file-upload');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

const router=express.Router();

const {
    alumniList,
    alumnus,
    updateAlumnusStatus,
    deleteAlumnus,
    updateAccount
}=require('../controllers/alumni.controller');


// alumni routes
router.get('/', alumniList);
router.get('/:id', alumnus);
router.put('/status', authenticate, isAdmin, updateAlumnusStatus);
router.delete('/:id', authenticate, isAdmin, deleteAlumnus);

// route for updating account with avatar upload
router.put('/account', authenticate, avatarUpload.single('avatar'), updateAccount);



module.exports=router;