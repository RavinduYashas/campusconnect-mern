const express = require("express");
const router = express.Router();
const {
    getGroups,
    joinGroup,
    createQuestion,
    createAnswer,
    getQuestionsByGroup,
    getCommunityMembers,
    updateQuestion,
    deleteQuestion,
    updateAnswer,
    deleteAnswer,
    toggleLikeAnswer,
    markAnswerSolved,
    getProfileQAData,
    leaveGroup
} = require("../../controllers/QA/qaController");
const { protect } = require("../../middleware/authMiddleware");

router.use(protect);

router.get("/groups", getGroups);
router.get("/members", getCommunityMembers);
router.post("/groups/:groupId/join", joinGroup);
router.post("/groups/:groupId/leave", leaveGroup);
router.get("/groups/:groupId/questions", getQuestionsByGroup);
router.get("/profile-data/:userId", getProfileQAData);
router.post("/questions", createQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);
router.post("/questions/:questionId/answers", createAnswer);
router.put("/answers/:id", updateAnswer);
router.delete("/answers/:id", deleteAnswer);
router.post("/answers/:id/like", toggleLikeAnswer);
router.post("/answers/:id/solve", markAnswerSolved);

module.exports = router;
