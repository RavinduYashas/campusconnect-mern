const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String },
    language: { type: String },

    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },

    askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer"
    }],

    isSolved: {
        type: Boolean,
        default: false
    },

    solvedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        default: null
    },

    topic: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
