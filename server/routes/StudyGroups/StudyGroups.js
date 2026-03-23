// routes/StudyGroups/StudyGroups.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  createStudyGroup,
  getAllStudyGroups,
  getMyStudyGroups,
  getPendingRequests,
  requestToJoin,
  handleJoinRequest,
  leaveGroup,
  deleteStudyGroup,
  getStudyGroupDetails,
  addMeeting,
  addSession,
  addStudyMaterial,
  deleteStudyMaterial,
  addStudySession,
  deleteStudySession,
  sendMessage,
  getMessages
} = require('../../controllers/StudyGroups/StudyGroups');

// Debug middleware
router.use((req, res, next) => {
  console.log(`Study Group Route: ${req.method} ${req.originalUrl}`);
  next();
});

router.route('/')
  .get(protect, getAllStudyGroups)
  .post(protect, createStudyGroup);

router.get('/my-groups', protect, getMyStudyGroups);
router.get('/pending-requests', protect, getPendingRequests);

router.post('/:groupId/request', protect, requestToJoin);
router.put('/:groupId/handle-request/:userId', protect, handleJoinRequest);
router.delete('/:groupId/leave', protect, leaveGroup);
router.delete('/:groupId', protect, deleteStudyGroup);
router.get('/:groupId', protect, getStudyGroupDetails);

// Study Materials routes
router.post('/:groupId/materials', protect, addStudyMaterial);
router.delete('/:groupId/materials/:materialId', protect, deleteStudyMaterial);

// Study Sessions routes
router.post('/:groupId/sessions', protect, addStudySession);
router.delete('/:groupId/sessions/:sessionId', protect, deleteStudySession);

// Chat routes
router.post('/:groupId/messages', protect, sendMessage);
router.get('/:groupId/messages', protect, getMessages);

// Keep old routes for compatibility
router.post('/:groupId/meetings', protect, addMeeting);
router.post('/:groupId/sessions', protect, addSession);

module.exports = router;