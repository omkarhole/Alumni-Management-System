const {SystemSetting}=require('../models/index');

// get all settings
async function getSettings(req, res, next) {
  try { res.json(await SystemSetting.findAll()); } catch (err) { next(err); }
}


module.exports={getSettings};   