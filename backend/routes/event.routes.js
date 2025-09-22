const express=require('express');
const router=express.Router();

const {listEvents,addEvent,updateEvent,deleteEvent,participateEvent,checkParticipation, upcomingEvents}=require('../controllers/event.controller');


// all event routes

router.get('/',listEvents);
router.post('/',addEvent);
router.put('/:id',updateEvent);
router.delete('/:id',deleteEvent);
router.post('/participate',participateEvent);
router.post('/participation-check',checkParticipation);
router.get('/upcoming',upcomingEvents);

module.exports=router;