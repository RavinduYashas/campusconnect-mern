const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ===== Signup Data =====
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /@(my\.sliit\.lk|sliitplatform\.com)$/
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "expert", "admin"],
    required: true,
    default: "student"
  },
  registerNumber: String,
  field: String,
  // ===== Profile Data =====
  avatar: {
    type: String,
    default: "/avatars/avatar1.png"
  },
  academicInfo: {
    year: Number,
    semester: Number
  },
  professionalInfo: {
    company: String,
    jobTitle: String,
    experienceYears: Number
  },
  bio: String,
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
