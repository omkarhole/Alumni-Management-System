const {Op,literal}=require('sequelize');
const {Event,EventCommit}=require('../models/index')

//all events details

 async function listEvents(req, res, next) {
    try {
        const events = await Event.findAll({ include: { model: EventCommit, as: 'commits' }, order: [['schedule', 'DESC']] });
        res.json(events);
    } catch (err) {
        next(err);
    }
    
}

// add event
async function addEvent(req, res, next) {
    try {
        res.status(201).json(await Event.create(req.body));
    } catch (err) {
        next(err);
    }
}

// update event
 async function updateEvent(req, res, next) {
    try {
        await Event.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Updated' });
    } catch (err) {
        next(err);
    }
}
// delete event

async function deleteEvent(req,res,next){
    try{
         await Event.destroy({ where: { id: req.params.id } });
            res.json({ message: 'Deleted' });
    }
    catch(err){
        next(err);
    }
}
// participate event
async function participateEvent(req, res, next) {
    try {
        await EventCommit.create(req.body);
        res.json({ message: 'Participated' });
    } catch (err) {
        next(err);
    }
}
// check participation
async function checkParticipation(req, res, next) {
    try {
        const exists = await EventCommit.findOne({ where: req.body });
        res.json({ participated: !!exists });
    } catch (err) { next(err); }
}

// upcomming events
async function upcomingEvents(req, res, next) {
  try {
      res.json(await Event.findAll({
          where: {
              schedule: {
                  [Op.gte]: literal('CURRENT_TIMESTAMP')
              }
          },
          order: [['schedule', 'ASC']]
      }));
  } catch (err) {
      next(err);
  }
}
module.exports={listEvents,addEvent,updateEvent,deleteEvent,participateEvent,checkParticipation,upcomingEvents};