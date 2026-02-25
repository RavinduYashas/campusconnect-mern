const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateAvatar, updateProfile, getAllUsers, updateUserRole, deleteUser, sendOTP, verifyOTP } = require('../controllers/userController');
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
router.put('/role/:id', protect, roleAuthorize('admin'), updateUserRole);
router.delete('/:id', protect, roleAuthorize('admin'), deleteUser);

module.exports = router;
