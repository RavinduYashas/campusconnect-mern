const express = require('express');
const router = express.Router();
const { 
    createSkillRequest, 
    getSkillRequests, 
    updateSkillRequest, 
    deleteSkillRequest, 
    replyToSkillRequest,
    createSkill,
    getSkills,
    getSkillById,
    updateSkill,
    deleteSkill
} = require('../../controllers/SkillExchange/skillController');

const { protect } = require('../../middleware/authMiddleware');

// Skill Requests Routes
router.route('/requests')
    .post(protect, createSkillRequest)
    .get(protect, getSkillRequests);

router.route('/requests/:id')
    .put(protect, updateSkillRequest)
    .delete(protect, deleteSkillRequest);

router.post('/requests/:id/reply', protect, replyToSkillRequest);

// Skills (Offers) Routes
router.route('/offers')
    .post(protect, createSkill)
    .get(protect, getSkills);

router.route('/offers/:id')
    .get(protect, getSkillById)
    .put(protect, updateSkill)
    .delete(protect, deleteSkill);

module.exports = router;
