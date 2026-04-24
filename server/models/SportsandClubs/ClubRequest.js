const mongoose = require('mongoose');

const clubRequestSchema = mongoose.Schema(
    {
        club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'approved', 'rejected', 'waitlisted'], default: 'pending' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ClubRequest', clubRequestSchema);
