const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const transactionController = require("../controllers/transactionController");
const {
  createStripeCheckout,
  sendFeedbackMail,
  getPaymentStats,
  getPaymentTrends,
  approveRemainingAmount,
  getPendingAdvancedTransactions,
  getPaymentStatsForUser,
  getUserPaymentStats
} = transactionController;

const { getUserTransactions } = require("../controllers/getUserTransactions");

router.post("/stripe-checkout", authMiddleware, createStripeCheckout);
router.get("/my-transactions", authMiddleware, getUserTransactions);

// ✅ Add new feedback mail route
router.post("/send-feedback-mail", authMiddleware, sendFeedbackMail);

// Get payment statistics (admin only)
router.get("/stats", authMiddleware, getPaymentStats);

// Get payment trends (admin only)
router.get("/trends", authMiddleware, getPaymentTrends);

// Advanced Money Mode routes (admin only)
router.get("/pending-advanced", authMiddleware, getPendingAdvancedTransactions);
router.post("/approve-remaining/:transactionId", authMiddleware, approveRemainingAmount);

// Add user-specific stats route
router.get("/stats/user", authMiddleware, getPaymentStatsForUser);

// Add user-specific self payment stats route
router.get("/stats/user/self", authMiddleware, getUserPaymentStats);

module.exports = router;
