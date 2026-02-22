const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getAllSkills,
  endorseUser,
  getUserEndorsements,
  removeEndorsement,
  getUserSkills,
  addUserSkill,
  removeUserSkill
} = require('../controllers/skill.controller');

const router = express.Router();

// GET /api/admin/skills - Get all skills with endorsement counts
router.get('/', getAllSkills);

// GET /api/admin/skills/user/:userId - Get skills for a specific user
router.get('/user/:userId', getUserSkills);

// GET /api/admin/skills/endorsements/:userId - Get endorsements received by a user
router.get('/endorsements/:userId', getUserEndorsements);

// POST /api/admin/skills/endorse - Endorse a user for a skill
router.post('/endorse', authenticate, endorseUser);

// POST /api/admin/skills/user - Add a skill to current user's profile
router.post('/user', authenticate, addUserSkill);

// DELETE /api/admin/skills/user - Remove a skill from current user's profile
router.delete('/user', authenticate, removeUserSkill);

// DELETE /api/admin/skills/endorse/:id - Remove an endorsement
router.delete('/endorse/:id', authenticate, removeEndorsement);

module.exports = router;
