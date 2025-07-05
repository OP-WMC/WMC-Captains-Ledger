const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createStripeCheckout } = require("../controllers/transactionController");

router.post("/stripe-checkout", auth, createStripeCheckout);

module.exports = router;
