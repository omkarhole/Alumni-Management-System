const {Event}=require('../models/index')

//all events details
async function listEvents(req, res, next) {
    try {
        const events = await Event.find()
            .populate('commits.user', 'name')
            .sort({ schedule: -1 });
        res.json(events);
    } catch (err) {
        next(err);
    }
}

// add event
async function addEvent(req, res, next) {
    try {
        const event = await Event.create(req.body);
        res.status(201).json({ message: 'Created', event });
    } catch (err) {
        next(err);
    }
}

// update event
async function updateEvent(req, res, next) {
    try {
        const updateData = { ...req.body };
        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.id;
        
        await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: 'Updated' });
    } catch (err) {
        next(err);
    }
}
// delete event
async function deleteEvent(req,res,next){
    try{
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    }
    catch(err){
        next(err);
    }
}
// participate event
async function participateEvent(req, res, next) {
    try {
        const event = await Event.findById(req.body.event_id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        event.commits.push({ user: req.body.user_id });
        await event.save();
        res.json({ message: 'Participated' });
    } catch (err) {
        next(err);
    }
}
// check participation
async function checkParticipation(req, res, next) {
    try {
        const event = await Event.findById(req.body.event_id);
        const participated = event && event.commits.some(
            commit => commit.user.toString() === req.body.user_id
        );
        res.json({ participated: !!participated });
    } catch (err) { next(err); }
}

// upcomming events
async function upcomingEvents(req, res, next) {
    try {
        res.json(await Event.find({
            schedule: { $gte: new Date() }
        }).sort({ schedule: 1 }));
    } catch (err) {
        next(err);
    }
}
module.exports={listEvents,addEvent,updateEvent,deleteEvent,participateEvent,checkParticipation,upcomingEvents};