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
  getPendingAdvancedTransactions
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

module.exports = router;
