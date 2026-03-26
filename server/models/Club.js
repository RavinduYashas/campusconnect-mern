const mongoose = require('mongoose');

const clubSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        formerMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Club', clubSchema);
