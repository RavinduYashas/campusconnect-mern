const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUserById, updateAvatar, updateProfile, getAllUsers, updateUser, updateUserRole, deleteUser, sendOTP, verifyOTP, adminCreateUser, getExpertCount, toggleRep } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { roleAuthorize } = require('../middleware/roleMiddleware');

router.post('/', registerUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/update-avatar', protect, updateAvatar);
router.put('/profile', protect, updateProfile);

// Admin Routes
router.get('/all', protect, roleAuthorize('admin'), getAllUsers);
router.get('/expert-count', protect, roleAuthorize('admin'), getExpertCount);
router.post('/admin-create', protect, roleAuthorize('admin'), adminCreateUser);
router.put('/role/:id', protect, roleAuthorize('admin'), updateUserRole);
router.put('/toggle-rep/:id', protect, roleAuthorize('admin'), toggleRep);
router.put('/:id', protect, roleAuthorize('admin'), updateUser);
router.delete('/:id', protect, roleAuthorize('admin'), deleteUser);

// Dynamic path with :id should be at the end to avoid catching static paths like /all
router.get('/:id', protect, getUserById);

module.exports = router;
