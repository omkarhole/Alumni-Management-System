const Express=require('express');
const router=Express.Router();
const {getSettings}=require('../controllers/settings.controller');

// all settings routes
router.get('/', getSettings);


module.exports=router;