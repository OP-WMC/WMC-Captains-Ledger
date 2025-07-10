const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedbacks } = require("../controllers/feedbackController");
const verifyToken = require("../middleware/verifyToken");

router.post("/submit", verifyToken, submitFeedback); 
router.get("/", verifyToken, getFeedbacks); // For dashboard

module.exports = router;
