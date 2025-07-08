const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
  createStripeCheckout,
  sendFeedbackMail,  // ✅ Add this
} = require("../controllers/transactionController");

const { getUserTransactions } = require("../controllers/getUserTransactions");

router.post("/stripe-checkout", verifyToken, createStripeCheckout);
router.get("/my-transactions", verifyToken, getUserTransactions);

// ✅ Add new feedback mail route
router.post("/send-feedback-mail", verifyToken, sendFeedbackMail);

module.exports = router;
