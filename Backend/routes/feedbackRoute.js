const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedbacks } = require("../controllers/feedbackController");
// const verifyToken = require("../middleware/verifyToken");
const auth = require("../middleware/authMiddleware");

router.post("/submit", auth,submitFeedback); 
router.get("/", auth, getFeedbacks); // For dashboard

module.exports = router;
