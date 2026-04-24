// routes/Workshops/Workshops.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  registerForWorkshop,
  cancelRegistration,
  uploadMaterial,
  requestWorkshop,
  updateWorkshopStatus,
  getMyRequests,           // Add this
  getAssignedRequests,     // Add this
  updateRequestStatus,     // Add this
  voteForRequest           // Add this
} = require('../../controllers/Workshops/Workshops');

router.route('/')
  .get(protect, getAllWorkshops)
  .post(protect, createWorkshop);

// Workshop request routes
router.get('/my-requests', protect, getMyRequests);
router.get('/assigned-requests', protect, getAssignedRequests);
router.post('/requests', protect, requestWorkshop);
router.put('/requests/:id/status', protect, updateRequestStatus);
router.post('/requests/:id/vote', protect, voteForRequest);

router.get('/:id', protect, getWorkshopById);
router.post('/:id/register', protect, registerForWorkshop);
router.delete('/:id/cancel', protect, cancelRegistration);
router.post('/:id/materials', protect, uploadMaterial);
router.put('/:id/status', protect, updateWorkshopStatus);

module.exports = router;