const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendVerificationEmail } = require('../utils/emailUtils');


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email: rawEmail, password, avatar, otp } = req.body;
    const email = rawEmail?.toLowerCase();

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // SLIIT email parsing (e.g., it21001234@my.sliit.lk)
        const registerNumber = email.split("@")[0].toUpperCase();
        const field = registerNumber.substring(0, 2);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student",
            registerNumber,
            field,
            avatar: avatar || "/avatars/avatar1.png",
            isVerified: true
        });

        // Delete OTP after successful registration
        await OTP.deleteOne({ _id: otpRecord._id });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase();

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user avatar
// @route   PUT /api/users/update-avatar
// @access  Private
const updateAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.avatar = req.body.avatar || user.avatar;
            const updatedUser = await user.save();
            res.json({
                message: "Avatar updated",
                avatar: updatedUser.avatar
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.avatar = req.body.avatar || user.avatar;
            user.bio = req.body.bio || user.bio;

            if (user.role === 'student') {
                user.academicInfo = {
                    year: req.body.year || user.academicInfo?.year,
                    semester: req.body.semester || user.academicInfo?.semester
                };
            }

            if (user.role === 'expert') {
                user.professionalInfo = {
                    company: req.body.company || user.professionalInfo?.company,
                    jobTitle: req.body.jobTitle || user.professionalInfo?.jobTitle,
                    experienceYears: req.body.experienceYears || user.professionalInfo?.experienceYears
                };
            }

            user.profileCompleted = true;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                academicInfo: updatedUser.academicInfo,
                professionalInfo: updatedUser.professionalInfo,
                profileCompleted: updatedUser.profileCompleted,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/role/:id
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP to email
// @route   POST /api/users/send-otp
// @access  Public
const sendOTP = async (req, res) => {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase();
    console.log(`Received OTP request for email: ${email}`);

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    // SLIIT email validation
    const sliitEmailRegex = /@(my\.sliit\.lk|sliitplatform\.com)$/;
    if (!sliitEmailRegex.test(email)) {
        return res.status(400).json({ message: 'Please use a valid SLIIT email address' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (upsert)
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Send email
        const emailSent = await sendVerificationEmail(email, otp);

        if (emailSent) {
            res.status(200).json({ message: 'Verification code sent to email' });
        } else {
            res.status(500).json({ message: 'Failed to send verification email' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP (Standalone check)
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    const { email: rawEmail, otp } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and verification code are required' });
    }

    console.log(`Attempting to verify OTP for ${email}. Submitted: ${otp}`);

    try {
        // Find the record and log it for debugging
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            console.log(`No OTP record found for ${email}`);
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        console.log(`Found OTP record for ${email}. Stored code: ${otpRecord.otp}`);

        if (otpRecord.otp !== otp.toString()) {
            console.log(`OTP Mismatch! Stored: ${otpRecord.otp}, Submitted: ${otp}`);
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        console.log(`OTP Verification Successful for ${email}`);
        res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateAvatar,
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
    sendOTP,
    verifyOTP,
};
