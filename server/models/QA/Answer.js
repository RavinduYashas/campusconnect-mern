const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    content: { type: String, required: true },
    code: { type: String },
    language: { type: String },


    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },

    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isSolved: {
        type: Boolean,
        default: false
    },

    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    }

}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);
