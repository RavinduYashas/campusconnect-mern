// controllers/Workshops/Workshops.js
const Workshop = require('../../models/Workshops/Workshops');
const WorkshopRequest = require('../../models/Workshops/WorkshopRequest');
const User = require('../../models/User');

// Helper functions
const isBatchRep = (user) => {
  return user && user.isBatchRep === true;
};

const isLecturer = (user) => {
  return user && user.email && user.email.match(/^ept\d{3}@sliitplatform\.com$/);
};

// Get batch reps for specific faculty and academic year
const getBatchRepsForFacultyYear = async (faculty, academicYear) => {
  const batchReps = await User.find({
    isBatchRep: true,
    'batchRepDetails.faculty': faculty,
    'batchRepDetails.academicYear': academicYear
  });
  return batchReps;
};

// @desc    Create a new workshop
// @route   POST /api/workshops
// @access  Private (Batch Reps, Lecturers, Admins)
const createWorkshop = async (req, res) => {
  const { 
    title, description, category, date, duration, location, 
    capacity, academicYear, faculty 
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'Only batch representatives and lecturers can create workshops' 
      });
    }

    const workshop = await Workshop.create({
      title,
      description,
      category: category || 'Technical',
      date: new Date(date),
      duration,
      location,
      capacity: capacity || 50,
      academicYear,
      faculty,
      createdBy: req.user.id,
      createdByEmail: user.email,
      workshopType: new Date(date) > new Date() ? 'upcoming' : 'ended'
    });

    res.status(201).json(workshop);
  } catch (error) {
    console.error('Error creating workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workshops with filtering
// @route   GET /api/workshops
// @access  Private
const getAllWorkshops = async (req, res) => {
  try {
    const { type, category, faculty, academicYear, search } = req.query;
    let filter = { isActive: true };

    if (type && type !== 'all') {
      filter.workshopType = type;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (faculty && faculty !== 'all') {
      filter.faculty = faculty;
    }
    
    if (academicYear && academicYear !== 'all') {
      filter.academicYear = academicYear;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const workshops = await Workshop.find(filter)
      .populate('createdBy', 'name email avatar isBatchRep batchRepDetails')
      .populate('registeredStudents', 'name avatar')
      .populate('materials.uploadedBy', 'name')
      .sort({ date: 1 });

    const workshopsWithDetails = workshops.map(workshop => {
      const isRegistered = workshop.registeredStudents.some(
        student => student._id.toString() === req.user.id
      );
      const isOnWaitlist = workshop.waitlist.some(
        student => student.toString() === req.user.id
      );
      
      return {
        ...workshop.toObject(),
        isRegistered,
        isOnWaitlist,
        availableSpots: workshop.capacity - workshop.registeredStudents.length,
        registrationCount: workshop.registeredStudents.length
      };
    });

    res.json(workshopsWithDetails);
  } catch (error) {
    console.error('Error getting workshops:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workshop by ID
// @route   GET /api/workshops/:id
// @access  Private
const getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('createdBy', 'name email avatar isBatchRep batchRepDetails')
      .populate('registeredStudents', 'name avatar email')
      .populate('waitlist', 'name avatar email')
      .populate('materials.uploadedBy', 'name');

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const isRegistered = workshop.registeredStudents.some(
      student => student._id.toString() === req.user.id
    );
    const isOnWaitlist = workshop.waitlist.some(
      student => student.toString() === req.user.id
    );

    const workshopDetails = {
      ...workshop.toObject(),
      isRegistered,
      isOnWaitlist,
      availableSpots: workshop.capacity - workshop.registeredStudents.length,
      registrationCount: workshop.registeredStudents.length
    };

    res.json(workshopDetails);
  } catch (error) {
    console.error('Error getting workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register for workshop
// @route   POST /api/workshops/:id/register
// @access  Private
const registerForWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    if (workshop.workshopType === 'ended') {
      return res.status(400).json({ message: 'This workshop has already ended' });
    }

    if (workshop.registeredStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this workshop' });
    }

    if (workshop.registeredStudents.length < workshop.capacity) {
      workshop.registeredStudents.push(req.user.id);
      await workshop.save();
      res.json({ message: 'Successfully registered for workshop', status: 'registered' });
    } else {
      workshop.waitlist.push(req.user.id);
      await workshop.save();
      res.json({ message: 'Workshop is full. You have been added to the waitlist', status: 'waitlisted' });
    }
  } catch (error) {
    console.error('Error registering for workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/workshops/:id/cancel
// @access  Private
const cancelRegistration = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    const registeredIndex = workshop.registeredStudents.indexOf(req.user.id);
    if (registeredIndex !== -1) {
      workshop.registeredStudents.splice(registeredIndex, 1);
      
      if (workshop.waitlist.length > 0) {
        const firstOnWaitlist = workshop.waitlist.shift();
        workshop.registeredStudents.push(firstOnWaitlist);
      }
      
      await workshop.save();
      res.json({ message: 'Registration cancelled successfully' });
    } else {
      const waitlistIndex = workshop.waitlist.indexOf(req.user.id);
      if (waitlistIndex !== -1) {
        workshop.waitlist.splice(waitlistIndex, 1);
        await workshop.save();
        res.json({ message: 'Removed from waitlist successfully' });
      } else {
        res.status(400).json({ message: 'You are not registered for this workshop' });
      }
    }
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a workshop (student request)
// @route   POST /api/workshops/requests
// @access  Private
const requestWorkshop = async (req, res) => {
  const { topic, description, category, faculty, academicYear } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    // Find batch reps for this faculty and academic year
    const batchReps = await getBatchRepsForFacultyYear(faculty, academicYear);
    
    if (batchReps.length === 0) {
      return res.status(404).json({ 
        message: `No batch representative found for ${faculty} - ${academicYear}. Please contact an admin.` 
      });
    }
    
    // Create request and assign to first batch rep
    const request = await WorkshopRequest.create({
      topic,
      description,
      category: category || 'Technical',
      faculty,
      academicYear,
      requestedBy: req.user.id,
      requestedByName: user.name,
      requestedByEmail: user.email,
      status: 'pending',
      assignedTo: batchReps[0]._id,
      assignedToName: batchReps[0].name,
      assignedToEmail: batchReps[0].email
    });

    res.status(201).json({ 
      message: 'Workshop request submitted successfully! It will be reviewed by your batch representative.',
      request 
    });
  } catch (error) {
    console.error('Error requesting workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workshop requests (for batch reps and lecturers)
// @route   GET /api/workshops/requests/all
// @access  Private
const getWorkshopRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    let query = {};
    
    // If user is batch rep, only show requests matching their faculty/year
    if (isBatchRep(user)) {
      query = {
        faculty: user.batchRepDetails.faculty,
        academicYear: user.batchRepDetails.academicYear,
        status: 'pending'
      };
    }
    // If lecturer or admin, show all pending requests
    else if (isLecturer(user) || user.role === 'admin') {
      query = { status: 'pending' };
    }
    // Regular students can see their own requests
    else {
      query = { requestedBy: req.user.id };
    }
    
    const requests = await WorkshopRequest.find(query)
      .populate('requestedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting workshop requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve workshop request and create workshop
// @route   PUT /api/workshops/requests/:id/approve
// @access  Private (Batch Reps, Lecturers, Admins)
const approveWorkshopRequest = async (req, res) => {
  const { 
    title, description, date, duration, location, 
    capacity, category 
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to approve requests' });
    }
    
    const request = await WorkshopRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Verify batch rep has authority over this request
    if (isBatchRep(user) && 
        (request.faculty !== user.batchRepDetails.faculty || 
         request.academicYear !== user.batchRepDetails.academicYear)) {
      return res.status(403).json({ message: 'You can only approve requests for your batch' });
    }
    
    // Create the workshop
    const workshop = await Workshop.create({
      title: title || request.topic,
      description: description || request.description,
      category: category || request.category,
      date: new Date(date),
      duration,
      location,
      capacity: capacity || 50,
      academicYear: request.academicYear,
      faculty: request.faculty,
      createdBy: req.user.id,
      createdByEmail: user.email,
      workshopType: 'upcoming'
    });
    
    // Update the request
    request.status = 'approved';
    request.responseMessage = `Your workshop request has been approved! Workshop scheduled for ${new Date(date).toLocaleDateString()}`;
    request.respondedAt = new Date();
    request.scheduledWorkshop = workshop._id;
    await request.save();
    
    res.json({ 
      message: 'Workshop request approved and scheduled successfully',
      workshop,
      request
    });
  } catch (error) {
    console.error('Error approving workshop request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject workshop request
// @route   PUT /api/workshops/requests/:id/reject
// @access  Private (Batch Reps, Lecturers, Admins)
const rejectWorkshopRequest = async (req, res) => {
  const { responseMessage } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to reject requests' });
    }
    
    const request = await WorkshopRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Verify batch rep has authority
    if (isBatchRep(user) && 
        (request.faculty !== user.batchRepDetails.faculty || 
         request.academicYear !== user.batchRepDetails.academicYear)) {
      return res.status(403).json({ message: 'You can only reject requests for your batch' });
    }
    
    request.status = 'rejected';
    request.responseMessage = responseMessage || 'Your workshop request was not approved at this time.';
    request.respondedAt = new Date();
    await request.save();
    
    res.json({ message: 'Workshop request rejected', request });
  } catch (error) {
    console.error('Error rejecting workshop request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote for a workshop request
// @route   POST /api/workshops/requests/:id/vote
// @access  Private
const voteForRequest = async (req, res) => {
  try {
    const request = await WorkshopRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const hasVoted = request.votes.some(vote => vote.user.toString() === req.user.id);
    
    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted for this request' });
    }
    
    request.votes.push({ user: req.user.id });
    request.voteCount = request.votes.length;
    
    await request.save();
    
    res.json({ message: 'Vote added successfully', voteCount: request.voteCount });
  } catch (error) {
    console.error('Error voting for request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workshop status
// @route   PUT /api/workshops/:id/status
// @access  Private (Batch Reps, Lecturers, Admins)
const updateWorkshopStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const workshop = await Workshop.findById(req.params.id);
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only batch reps and lecturers can update workshop status' });
    }

    workshop.workshopType = status;
    await workshop.save();

    res.json({ message: 'Workshop status updated successfully', workshop });
  } catch (error) {
    console.error('Error updating workshop status:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};