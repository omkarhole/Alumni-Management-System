const {SystemSetting}=require('../models/Index');

// get all settings
async function getSettings(req, res, next) {
  try { res.json(await SystemSetting.findAll()); } catch (err) { next(err); }
}


module.exports={getSettings};   