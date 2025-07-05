const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const { createStripeCheckout } = require("../controllers/transactionController");
const{ getUserTransactions } = require("../controllers/getUserTransactions");

router.post("/stripe-checkout", verifyToken, createStripeCheckout);
router.get("/my-transactions", verifyToken, getUserTransactions); 


module.exports = router;
