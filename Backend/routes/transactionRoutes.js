const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const { createStripeCheckout } = require("../controllers/transactionController");

router.post("/stripe-checkout", verifyToken, createStripeCheckout);

module.exports = router;
