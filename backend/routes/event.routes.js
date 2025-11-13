const express=require('express');
const router=express.Router();

const {listEvents,addEvent,updateEvent,deleteEvent,participateEvent,checkParticipation, upcomingEvents}=require('../controllers/event.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// all event routes

router.get('/', listEvents);
router.post('/', authenticate, isAdmin, addEvent);
router.put('/:id', authenticate, isAdmin, updateEvent);
router.delete('/:id', authenticate, isAdmin, deleteEvent);
router.post('/participate', authenticate, participateEvent);
router.post('/participation-check', authenticate, checkParticipation);
router.get('/upcoming', upcomingEvents);

module.exports=router;