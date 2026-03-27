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
  requestWorkshop,
  getWorkshopRequests,
  approveWorkshopRequest,
  rejectWorkshopRequest,
  voteForRequest,
  updateWorkshopStatus
} = require('../../controllers/Workshops/Workshops');

// Workshop CRUD
router.get('/', protect, getAllWorkshops);
router.get('/:id', protect, getWorkshopById);
router.post('/', protect, createWorkshop);
router.put('/:id/status', protect, updateWorkshopStatus);

// Workshop registration
router.post('/:id/register', protect, registerForWorkshop);
router.delete('/:id/cancel', protect, cancelRegistration);

// Workshop requests
router.post('/requests', protect, requestWorkshop);
router.get('/requests/all', protect, getWorkshopRequests);
router.put('/requests/:id/approve', protect, approveWorkshopRequest);
router.put('/requests/:id/reject', protect, rejectWorkshopRequest);
router.post('/requests/:id/vote', protect, voteForRequest);

module.exports = router;