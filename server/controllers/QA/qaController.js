const Group = require("../../models/QA/Group");
const Question = require("../../models/QA/Question");
const Answer = require("../../models/QA/Answer");
const User = require("../../models/User");
const Notification = require("../../models/QA/Notification");

// @desc    Get all groups
// @route   GET /api/qa/groups
// @access  Private
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Join a group
// @route   POST /api/qa/groups/:groupId/join
// @access  Private
exports.joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const userId = req.user.id;

        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();

            await User.findByIdAndUpdate(userId, {
                $addToSet: { joinedGroups: group._id }
            });
        }

        res.json({ message: "Joined successfully", groupId: group._id });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Leave a group
// @route   POST /api/qa/groups/:groupId/leave
// @access  Private
exports.leaveGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        const userId = req.user.id;

        // Remove user from group members
        group.members = group.members.filter(m => m.toString() !== userId);
        await group.save();

        // Remove group from user joinedGroups
        await User.findByIdAndUpdate(userId, {
            $pull: { joinedGroups: group._id }
        });

        res.json({ message: "Left group successfully", groupId: group._id });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a question
// @route   POST /api/qa/questions
// @access  Private (Students only)
exports.createQuestion = async (req, res) => {
    try {
        const { title, description, groupId, code, language, topic } = req.body;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Check membership
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: "Join this group first" });
        }

        // Check role
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can ask questions" });
        }

        const question = await Question.create({
            title,
            description,
            code,
            language,
            topic,
            group: groupId,
            askedBy: req.user.id
        });

        // --- Notification Logic ---
        // Find experts in the group
        const experts = await User.find({ role: 'expert', joinedGroups: groupId });

        if (experts.length > 0) {
            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');

            const notifications = experts.map(expert => ({
                recipient: expert._id,
                sender: req.user.id,
                type: 'new_question',
                question: question._id,
                group: groupId,
                message: `${req.user.name} asked a new question: "${title}"`
            }));

            await Notification.insertMany(notifications);

            experts.forEach(expert => {
                const socketId = userSockets.get(expert._id.toString());
                if (socketId) {
                    io.to(socketId).emit('new_notification', {
                        type: 'new_question',
                        questionId: question._id,
                        groupId: groupId,
                        message: `${req.user.name} asked a new question in ${group.name}`,
                        title: title
                    });
                }
            });
        }
        // --------------------------

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create an answer
// @route   POST /api/qa/questions/:questionId/answers
// @access  Private (Experts only)
exports.createAnswer = async (req, res) => {
    try {
        const { content, code, language } = req.body;
        const { questionId } = req.params;

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const group = await Group.findById(question.group);

        // Check membership
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: "You must join this group" });
        }

        // Check role
        if (req.user.role !== "expert") {
            return res.status(403).json({ message: "Only experts can answer" });
        }

        const answer = await Answer.create({
            content,
            code,
            language,
            question: questionId,
            answeredBy: req.user.id
        });

        // Add answer reference to question
        question.answers.push(answer._id);
        await question.save();

        // --- Notification Logic ---
        // Notify the student who asked the question
        if (question.askedBy.toString() !== req.user.id) {
            const notification = await Notification.create({
                recipient: question.askedBy,
                sender: req.user.id,
                type: 'new_answer',
                question: questionId,
                answer: answer._id,
                group: question.group,
                message: `${req.user.name} answered your question: "${question.title}"`
            });

            const io = req.app.get('io');
            const userSockets = req.app.get('userSockets');
            const socketId = userSockets.get(question.askedBy.toString());

            if (socketId) {
                io.to(socketId).emit('new_notification', {
                    type: 'new_answer',
                    questionId: questionId,
                    answerId: answer._id,
                    message: `${req.user.name} answered your question`,
                    title: question.title
                });
            }
        }
        // --------------------------

        res.status(201).json(answer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get questions by group
// @route   GET /api/qa/groups/:groupId/questions
// @access  Private (Members only)
exports.getQuestionsByGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        // Check membership
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ message: "Access denied. Join the group to view discussion." });
        }

        const { topic } = req.query;
        const query = { group: req.params.groupId };
        if (topic) query.topic = topic;

        const questions = await Question.find(query)
            .populate("askedBy", "name avatar")
            .populate({
                path: "answers",
                populate: { path: "answeredBy", select: "name avatar expertProfile" }
            })
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all community members (students & experts)
// @route   GET /api/qa/members
// @access  Private
exports.getCommunityMembers = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name avatar joinedGroups academicInfo field')
            .limit(10); // Optionally limit for performance

        const experts = await User.find({ role: 'expert' })
            .select('name avatar professionalInfo')
            .limit(10);

        res.json({ students, experts });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a question
// @route   PUT /api/qa/questions/:id
// @access  Private (Owner only)
exports.updateQuestion = async (req, res) => {
    try {
        const { title, description, code, language } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ message: "Question not found" });

        // Check ownership
        if (question.askedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check time limit (3 minutes)
        const diff = (Date.now() - new Date(question.createdAt).getTime()) / 1000 / 60;
        if (diff > 3) {
            return res.status(403).json({ message: "Edit window (3 mins) has closed" });
        }

        question.title = title || question.title;
        question.description = description || question.description;
        question.code = code !== undefined ? code : question.code;
        question.language = language || question.language;

        await question.save();
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/qa/questions/:id
// @access  Private (Owner only)
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) return res.status(404).json({ message: "Question not found" });

        // Check ownership
        if (question.askedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Delete associated answers
        await Answer.deleteMany({ question: question._id });
        await Question.findByIdAndDelete(req.params.id);

        res.json({ message: "Question and associated answers removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update an answer
// @route   PUT /api/qa/answers/:id
// @access  Private (Owner only)
exports.updateAnswer = async (req, res) => {
    try {
        const { content, code, language } = req.body;
        const answer = await Answer.findById(req.params.id);

        if (!answer) return res.status(404).json({ message: "Answer not found" });

        // Check ownership
        if (answer.answeredBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Check time limit (3 minutes)
        const diff = (Date.now() - new Date(answer.createdAt).getTime()) / 1000 / 60;
        if (diff > 3) {
            return res.status(403).json({ message: "Edit window (3 mins) has closed" });
        }

        answer.content = content || answer.content;
        answer.code = code !== undefined ? code : answer.code;
        answer.language = language || answer.language;

        await answer.save();
        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete an answer
// @route   DELETE /api/qa/answers/:id
// @access  Private (Owner only)
exports.deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) return res.status(404).json({ message: "Answer not found" });

        // Check ownership
        if (answer.answeredBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Remove reference from question
        await Question.findByIdAndUpdate(answer.question, {
            $pull: { answers: answer._id }
        });

        await Answer.findByIdAndDelete(req.params.id);

        res.json({ message: "Answer removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Toggle like on an answer
// @route   POST /api/qa/answers/:id/like
// @access  Private
exports.toggleLikeAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).json({ message: "Answer not found" });

        const userId = req.user.id;
        const likeIndex = answer.likes.indexOf(userId);

        if (likeIndex === -1) {
            answer.likes.push(userId);
        } else {
            answer.likes.splice(likeIndex, 1);
        }

        await answer.save();
        res.json({ likes: answer.likes.length, isLiked: answer.likes.includes(userId) });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Mark an answer as solved
// @route   POST /api/qa/answers/:id/solve
// @access  Private (Question Owner only)
exports.markAnswerSolved = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        if (!answer) return res.status(404).json({ message: "Answer not found" });

        const question = await Question.findById(answer.question);
        if (!question) return res.status(404).json({ message: "Question not found" });

        // Check ownership
        if (question.askedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the person who asked the question can mark it as solved" });
        }

        // Unmark previous solved answer if exists
        if (question.solvedAnswer) {
            await Answer.findByIdAndUpdate(question.solvedAnswer, { isSolved: false });
        }

        // Mark new answer as solved
        answer.isSolved = true;
        await answer.save();

        // Update question
        question.isSolved = true;
        question.solvedAnswer = answer._id;
        await question.save();

        res.json({ message: "Marked as solved", questionId: question._id, answerId: answer._id });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user Q&A stats and content for profile
// @route   GET /api/qa/profile-data/:userId
// @access  Private
exports.getProfileQAData = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get questions asked by user (with their full answers)
        const questions = await Question.find({ askedBy: userId })
            .populate("askedBy", "name avatar")
            .populate({
                path: "answers",
                populate: { path: "answeredBy", select: "name avatar" }
            })
            .sort({ createdAt: -1 });

        // Get answers given by user (with full context question and all other answers)
        const answers = await Answer.find({ answeredBy: userId })
            .populate({
                path: "question",
                populate: [
                    { path: "askedBy", select: "name avatar" },
                    { path: "answers", populate: { path: "answeredBy", select: "name avatar" } }
                ]
            })
            .sort({ createdAt: -1 });

        // Reputation stats
        const solvedCount = await Answer.countDocuments({ answeredBy: userId, isSolved: true });

        let totalLikes = 0;
        answers.forEach(ans => {
            totalLikes += ans.likes.length;
        });

        res.json({
            questions,
            answers,
            stats: {
                totalPosts: questions.length,
                totalAnswers: answers.length,
                solvedSolutions: solvedCount,
                helpfulLikes: totalLikes
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
