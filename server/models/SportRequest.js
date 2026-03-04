const mongoose = require('mongoose');

const sportRequestSchema = mongoose.Schema(
    {
        sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SportRequest', sportRequestSchema);
