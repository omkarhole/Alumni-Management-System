const {ForumTopic,Career,Event,User} =require('../models/index');

//get counts function 
async function getCounts(req, res, next) {
  try {
    const [ forumCount, jobCount, eventCount, upEventCount, alumniCount ] = await Promise.all([
      ForumTopic.countDocuments(),
      Career.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ schedule: { $gte: new Date() } }),
      User.countDocuments({ type: 'alumnus' })
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