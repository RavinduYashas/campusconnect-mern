// models/User.js
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
  isBatchRep: {
    type: Boolean,
    default: false
  },
  // Batch Rep Details - only populated if isBatchRep is true
  batchRepDetails: {
    faculty: {
      type: String,
      enum: ['Computing', 'Engineering', 'Humanities and Sciences', 'Business', 'Architecture', 'Other']
    },
    academicYear: {
      type: String,
      enum: ['Year 1 Sem 1', 'Year 1 Sem 2', 'Year 2 Sem 1', 'Year 2 Sem 2', 'Year 3 Sem 1', 'Year 3 Sem 2', 'Year 4 Sem 1', 'Year 4 Sem 2']
    }
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
      return this.role === "expert";
    }
  },
  banStatus: {
    isBanned: {
      type: Boolean,
      default: false
    },
    bannedUntil: {
      type: Date
    },
    banReason: {
      type: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);