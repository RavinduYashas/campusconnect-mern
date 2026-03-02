const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateAvatar, updateProfile, getAllUsers, updateUser, updateUserRole, deleteUser, sendOTP, verifyOTP, adminCreateUser, getExpertCount } = require('../controllers/userController');
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
router.put('/:id', protect, roleAuthorize('admin'), updateUser);
router.delete('/:id', protect, roleAuthorize('admin'), deleteUser);

module.exports = router;
