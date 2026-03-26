// controllers/Workshops/Workshops.js
const Workshop = require('../../models/Workshops/Workshops');
const User = require('../../models/User');
const WorkshopRequest = require('../../models/Workshops/WorkshopRequest'); // Make sure this file exists

// Helper functions
const isBatchRep = (user) => {
  return user && user.isBatchRep === true;
};

const isLecturer = (user) => {
  return user && user.email && user.email.match(/^ept\d{3}@sliitplatform\.com$/);
};

// Helper function to get batch rep for a specific faculty and year
const getBatchRepForFacultyYear = async (faculty, academicYear) => {
  const batchRep = await User.findOne({
    isBatchRep: true,
    'batchRepDetails.faculty': faculty,
    'batchRepDetails.academicYear': academicYear
  });
  return batchRep;
};

// @desc    Create a new workshop
const createWorkshop = async (req, res) => {
  const { title, description, category, date, duration, location, capacity } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only batch representatives and lecturers can create workshops' });
    }

    const workshop = await Workshop.create({
      title,
      description,
      category: category || 'Technical',
      date: new Date(date),
      duration,
      location,
      capacity: capacity || 50,
      createdBy: req.user.id,
      workshopType: new Date(date) > new Date() ? 'upcoming' : 'ended'
    });

    res.status(201).json(workshop);
  } catch (error) {
    console.error('Error creating workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workshops with filtering
const getAllWorkshops = async (req, res) => {
  try {
    const { type, category, search } = req.query;
    let filter = { isActive: true };

    if (type && type !== 'all') {
      filter.workshopType = type;
    }

    if (category && category !== 'all') {
      filter.category = category;
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

// @desc    Upload workshop material
const uploadMaterial = async (req, res) => {
  const { title, description, fileUrl, fileName, fileType, fileSize } = req.body;

  try {
    const workshop = await Workshop.findById(req.params.id);
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only batch reps and lecturers can upload materials' });
    }

    workshop.materials.push({
      title,
      description,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      uploadedBy: req.user.id
    });

    await workshop.save();
    res.status(201).json({ 
      message: 'Material uploaded successfully', 
      material: workshop.materials[workshop.materials.length - 1] 
    });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a workshop
const requestWorkshop = async (req, res) => {
  const { topic, description, category, faculty, academicYear } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    // Find the appropriate batch rep for this faculty and year
    const batchRep = await getBatchRepForFacultyYear(faculty, academicYear);
    
    if (!batchRep) {
      return res.status(404).json({ 
        message: `No batch representative found for ${faculty} - ${academicYear}. Please contact an admin.` 
      });
    }
    
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
      assignedTo: batchRep._id,
      assignedToName: batchRep.name,
      assignedToEmail: batchRep.email
    });

    res.status(201).json({ 
      message: 'Workshop request submitted successfully!',
      request 
    });
  } catch (error) {
    console.error('Error requesting workshop:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's workshop requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await WorkshopRequest.find({ requestedBy: req.user.id })
      .populate('assignedTo', 'name email')
      .populate('scheduledWorkshop', 'title date location')
      .sort('-createdAt');
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests assigned to user
const getAssignedRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isAuthorized = isBatchRep(user) || isLecturer(user) || user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only batch reps and lecturers can view assigned requests' });
    }
    
    let query = {};
    
    if (isBatchRep(user)) {
      query = {
        faculty: user.batchRepDetails.faculty,
        academicYear: user.batchRepDetails.academicYear,
        status: { $ne: 'completed' }
      };
    } else if (isLecturer(user) || user.role === 'admin') {
      query = { status: { $ne: 'completed' } };
    }
    
    const requests = await WorkshopRequest.find(query)
      .populate('requestedBy', 'name email avatar')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting assigned requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
const updateRequestStatus = async (req, res) => {
  const { status, responseMessage } = req.body;
  
  try {
    const request = await WorkshopRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const user = await User.findById(req.user.id);
    const isBatchRepUser = isBatchRep(user);
    const isLecturerUser = isLecturer(user);
    const isAuthorized = isBatchRepUser || isLecturerUser || user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to update this request' });
    }
    
    if (isBatchRepUser && !isLecturerUser && user.role !== 'admin') {
      if (request.faculty !== user.batchRepDetails.faculty || 
          request.academicYear !== user.batchRepDetails.academicYear) {
        return res.status(403).json({ message: 'You are not authorized to handle this request' });
      }
    }
    
    request.status = status;
    request.responseMessage = responseMessage;
    request.respondedAt = new Date();
    
    await request.save();
    
    res.json({ message: `Request ${status} successfully`, request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote for a workshop request
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
  uploadMaterial,
  requestWorkshop,
  updateWorkshopStatus,
  getMyRequests,
  getAssignedRequests,
  updateRequestStatus,
  voteForRequest
};