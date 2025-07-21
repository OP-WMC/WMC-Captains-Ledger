const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedbacks } = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/submit", authMiddleware, submitFeedback); 
router.get("/", authMiddleware, getFeedbacks); // For dashboard

module.exports = router;
