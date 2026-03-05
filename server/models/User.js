const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ===== Signup Data =====
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    lowercase: true,
    // match: /@(my\.sliit\.lk|sliitplatform\.com)$/ // Validated in controller per role
  },
  // Expert's personal email (only for sending credentials)
  realEmail: {
    type: String,
    required: function () { return this.role === "expert"; },
    trim: true,
    lowercase: true
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
  professionalInfo: [{
    company: String,
    jobTitle: String,
    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  bio: String,
  profileCompleted: {
    type: Boolean,
    default: false
  },
  joinedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  // ===== Security / Login =====
  mustChangePassword: {
    type: Boolean,
    default: function () {
      return this.role === "expert"; // force change for newly created experts
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
