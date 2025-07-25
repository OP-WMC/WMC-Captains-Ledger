// const express = require("express");
// const router = express.Router();
// const { submitFeedback, getFeedbacks } = require("../controllers/feedbackController");
// const authMiddleware = require("../middleware/authMiddleware");

// router.post("/submit", authMiddleware, submitFeedback); 
// router.get("/", authMiddleware, getFeedbacks); // For dashboard

// module.exports = router;
// backend/routes/feedbackRoute.js
const express = require("express");
const router = express.Router();
const { submitFeedback, getFeedbacks, deleteFeedback } = require("../controllers/feedbackController"); // Import deleteFeedback
const authMiddleware = require("../middleware/authMiddleware"); // Assuming this middleware correctly attaches req.user and checks auth state

router.post("/submit", authMiddleware, submitFeedback);
router.get("/", authMiddleware, getFeedbacks); // For dashboard

// NEW: Route to delete feedback by ID (admin only)
router.delete("/:id", authMiddleware, deleteFeedback); // The controller will handle the isAdmin check

module.exports = router;