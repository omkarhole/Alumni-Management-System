const {ForumTopic,Career,Event,User} =require('../models/index');

//get counts function 
async function getCounts(req, res, next) {
  try {
    const [ forumCount, jobCount, eventCount, upEventCount, alumniCount ] = await Promise.all([
      // total forum topics count
      ForumTopic.countDocuments(),
      // total jobs count
      Career.countDocuments(),
      // total events count
      Event.countDocuments(),
      // upcoming events count
      Event.countDocuments({ schedule: { $gte: new Date() } }),
    //  alumni count
      User.countDocuments({ type: 'alumnus' }),
      // students count
      User.countDocuments({ type: 'student' }),
      
    ]);
    // return counts as json
    res.json({
      forums: forumCount,
      jobs: jobCount,
      events: eventCount,
      upevents: upEventCount,
      alumni: alumniCount,
      students: studentCount
    });
  } catch (err) {
    next(err);
  }
}

module.exports=getCounts;