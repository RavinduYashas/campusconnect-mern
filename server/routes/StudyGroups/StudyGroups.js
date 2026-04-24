const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { roleAuthorize } = require('../../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/study-materials/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

const {
  createStudyGroup,
  getAllStudyGroups,
  getAllGroupsForAdmin,
  getMyStudyGroups,
  getPendingRequests,
  requestToJoin,
  handleJoinRequest,
  leaveGroup,
  deleteStudyGroup,
  toggleGroupStatus,
  getStudyGroupDetails,
  addMeeting,
  addSession,
  addStudyMaterial,
  deleteStudyMaterial,
  addStudySession,
  deleteStudySession,
  sendMessage,
  getMessages,
  requestStudySession,
  getSessionRequests,
  approveSessionRequest,
  rejectSessionRequest,
  uploadStudyMaterial
} = require('../../controllers/StudyGroups/StudyGroups');

router.use((req, res, next) => {
  console.log(`Study Group Route: ${req.method} ${req.originalUrl}`);
  next();
});

// ========== ADMIN ROUTES ==========
router.get('/admin/all', protect, roleAuthorize('admin'), getAllGroupsForAdmin);
router.put('/admin/:groupId/toggle-status', protect, roleAuthorize('admin'), toggleGroupStatus);

// ========== PUBLIC/DEBUG ROUTES ==========
router.get('/debug/all', protect, async (req, res) => {
  try {
    const StudyGroup = require('../../models/StudyGroups/StudyGroups');
    const allGroups = await StudyGroup.find({})
      .populate('owner', 'name avatar')
      .populate('members.user', 'name avatar');
    
    const groupsData = allGroups.map(g => ({
      id: g._id,
      name: g.name,
      isActive: g.isActive,
      type: g.type,
      faculty: g.faculty,
      academicYear: g.academicYear,
      memberCount: g.members.filter(m => m.status === 'approved').length,
      owner: g.owner ? g.owner.name : 'Unknown'
    }));
    
    res.json({ total: allGroups.length, groups: groupsData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/all', async (req, res) => {
  try {
    const StudyGroup = require('../../models/StudyGroups/StudyGroups');
    const allGroups = await StudyGroup.find({ isActive: true })
      .populate('owner', 'name avatar')
      .limit(10);
    
    res.json({ 
      total: allGroups.length,
      groups: allGroups.map(g => ({
        id: g._id,
        name: g.name,
        description: g.description,
        type: g.type,
        faculty: g.faculty,
        isActive: g.isActive,
        memberCount: g.members.filter(m => m.status === 'approved').length
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== MAIN ROUTES ==========
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

router.post('/:groupId/materials', protect, upload.single('file'), uploadStudyMaterial);
router.delete('/:groupId/materials/:materialId', protect, deleteStudyMaterial);

router.post('/:groupId/sessions', protect, addStudySession);
router.delete('/:groupId/sessions/:sessionId', protect, deleteStudySession);

router.post('/:groupId/session-requests', protect, requestStudySession);
router.get('/:groupId/session-requests', protect, getSessionRequests);
router.put('/:groupId/session-requests/:requestId/approve', protect, approveSessionRequest);
router.delete('/:groupId/session-requests/:requestId', protect, rejectSessionRequest);

router.post('/:groupId/messages', protect, sendMessage);
router.get('/:groupId/messages', protect, getMessages);

router.post('/:groupId/meetings', protect, addMeeting);
router.post('/:groupId/sessions', protect, addSession);

module.exports = router;