const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

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

router.post("/stripe-checkout", verifyToken, createStripeCheckout);
router.get("/my-transactions", verifyToken, getUserTransactions);

// ✅ Add new feedback mail route
router.post("/send-feedback-mail", verifyToken, sendFeedbackMail);

// Get payment statistics (admin only)
router.get("/stats", verifyToken, getPaymentStats);

// Get payment trends (admin only)
router.get("/trends", verifyToken, getPaymentTrends);

// Advanced Money Mode routes (admin only)
router.get("/pending-advanced", verifyToken, getPendingAdvancedTransactions);
router.post("/approve-remaining/:transactionId", verifyToken, approveRemainingAmount);

// Add user-specific stats route
router.get("/stats/user", verifyToken, getPaymentStatsForUser);

// Add user-specific self payment stats route
router.get("/stats/user/self", verifyToken, getUserPaymentStats);

module.exports = router;
