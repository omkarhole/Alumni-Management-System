const express=require('express');

const {avatarUpload}=require('../utils/file-upload');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

const router=express.Router();

const {
    alumniList,
    alumnus,
    updateAlumnusStatus,
    deleteAlumnus,
    updateAccount,
    advancedSearch,
    getFilterOptions,
    exportAlumni
}=require('../controllers/alumni.controller');


// alumni routes
router.get('/', alumniList);
router.get('/search', advancedSearch);
router.get('/filter-options', getFilterOptions);
router.get('/export', exportAlumni);
router.get('/:id', alumnus);
router.put('/status', authenticate, isAdmin, updateAlumnusStatus);
router.delete('/:id', authenticate, isAdmin, deleteAlumnus);

// route for updating account with avatar upload
router.put('/account', authenticate, avatarUpload.single('avatar'), updateAccount);



module.exports=router;
