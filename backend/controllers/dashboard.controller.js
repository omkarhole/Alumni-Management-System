const {ForumTopic,Career,Event,AlumnusBio} =require('../models/Index');
const {Op}=require('sequelize');



//get counts function 

  async function getCounts(req, res, next) {
  try {
    const [ forumCount, jobCount, eventCount, upEventCount, alumniCount ] = await Promise.all([
      ForumTopic.count(),
      Career.count(),
      Event.count(),
      Event.count({ where: { schedule: { [Op.gte]: new Date() } } }),
      AlumnusBio.count()
    ]);
    res.json({
      forums: forumCount,
      jobs: jobCount,
      events: eventCount,
      upevents: upEventCount,
      alumni: alumniCount
    });
  } catch (err) {
    next(err);
  }
}

module.exports=getCounts;