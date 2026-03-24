const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: [
            "Programming",
            "Web & Mobile",
            "Database",
            "Networking",
            "Software Engineering",
            "AI",
            "Data Science",
            "Cyber Security"
        ]
    },

    description: String,

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]

}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);
