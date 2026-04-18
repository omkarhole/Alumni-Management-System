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
    exportAlumni,
    getAlumniProfile,
    advancedAlumniDirectory,
    getDirectoryFilterOptions,
    initiateConnection,
    updateAlumniProfileInfo,
    updateEndorsementCount
}=require('../controllers/alumni.controller');


// alumni routes
router.get('/', alumniList);
router.get('/search', advancedSearch);
router.get('/filter-options', getFilterOptions);
router.get('/directory/options', getDirectoryFilterOptions);
router.get('/directory', advancedAlumniDirectory);
router.get('/profile/:alumniId', getAlumniProfile);
router.get('/export', exportAlumni);
router.get('/:id', alumnus);

router.put('/status', authenticate, isAdmin, updateAlumnusStatus);
router.delete('/:id', authenticate, isAdmin, deleteAlumnus);

// route for updating account with avatar upload
router.put('/account', authenticate, avatarUpload.single('avatar'), updateAccount);

// Advanced directory routes
router.post('/connect', authenticate, initiateConnection);
router.put('/profile/info', authenticate, updateAlumniProfileInfo);
router.put('/endorsements/:userId/count', updateEndorsementCount);

module.exports=router;
