// routes/Workshops/Workshops.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const Workshop = require('../../models/Workshops/Workshops');

// Get all workshops
router.get('/', protect, async (req, res) => {
  try {
    const workshops = await Workshop.find({})
      .populate('createdBy', 'name avatar')
      .sort('-createdAt');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create workshop
router.post('/', protect, async (req, res) => {
  try {
    const workshop = await Workshop.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for workshop
router.post('/:id/register', protect, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    if (workshop.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    
    if (workshop.attendees.length >= workshop.capacity) {
      return res.status(400).json({ message: 'Workshop is full' });
    }
    
    workshop.attendees.push(req.user.id);
    await workshop.save();
    
    res.json({ message: 'Successfully registered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;