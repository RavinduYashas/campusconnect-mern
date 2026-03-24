const express = require('express');
const router = express.Router();
const { createSport, getSports, getSport, updateSport, deleteSport, joinSport, requestToJoin, getRequests, approveRequest, rejectRequest, removeMember, activateMember, getAllSports, activateSport, getAllMembers, bulkUpdateSports, bulkAddMembers } = require('../controllers/sportController');
const { protect } = require('../middleware/authMiddleware');
const { roleAuthorize } = require('../middleware/roleMiddleware');

// allow optional auth on listing so admins can see inactive when authenticated
const { optionalProtect } = require('../middleware/authMiddleware');
router.get('/', optionalProtect, getSports);
router.get('/admin/all-teams', protect, roleAuthorize('admin'), getAllSports);
router.get('/admin/all-members', protect, roleAuthorize('admin'), getAllMembers);
router.post('/bulk', protect, roleAuthorize('admin'), bulkUpdateSports);
router.get('/:id', getSport);
router.post('/', protect, createSport);
router.put('/:id', protect, updateSport);
router.delete('/:id', protect, deleteSport);
// public join endpoint changed to request flow
router.post('/:id/request', protect, requestToJoin);
router.post('/:id/join', protect, joinSport); // kept for backward-compat but admin can switch

// admin/creator endpoints for requests and membership management
router.get('/:id/requests', protect, getRequests);
router.post('/:id/requests/:reqId/approve', protect, approveRequest);
router.post('/:id/requests/:reqId/reject', protect, rejectRequest);
router.delete('/:id/members/:memberId', protect, removeMember);
router.post('/:id/members/:memberId/activate', protect, activateMember);
router.post('/:id/activate', protect, activateSport);
router.post('/:id/bulk-members', protect, roleAuthorize('admin'), bulkAddMembers);

module.exports = router;
