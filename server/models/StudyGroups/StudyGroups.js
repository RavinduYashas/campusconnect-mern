// models/StudyGroups/StudyGroups.js
const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['open', 'private'],
    default: 'open'
  },
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    enum: ['Computing', 'Engineering', 'Humanities and Sciences', 'Business', 'Architecture', 'Other'],
    default: 'Computing'
  },
  academicYear: {
    type: String,
    enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
    default: 'Year 1'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  participantLimit: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  studyMaterials: [{
    title: String,
    description: String,
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  studySessions: [{
    title: String,
    description: String,
    date: Date,
    duration: Number,
    location: String,
    resources: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  sessionRequests: [{
    title: String,
    description: String,
    preferredDate: Date,
    preferredDuration: Number,
    topic: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [{
    text: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    userAvatar: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
studyGroupSchema.index({ faculty: 1, type: 1, academicYear: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ isActive: 1 });
studyGroupSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);