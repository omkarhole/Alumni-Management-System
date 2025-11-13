const Express=require('express');
const router=Express.Router();
const {getSettings}=require('../controllers/settings.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// all settings routes (admin only)
router.get('/', authenticate, isAdmin, getSettings);


module.exports=router;