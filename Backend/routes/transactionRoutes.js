const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // ✅ set in .env



// Optional auth middleware
const verifyToken = require('../middleware/verifyToken');

router.post('/stripe-checkout', verifyToken, async (req, res) => {
  const { amount, receiverEmail } = req.body;

  if (!amount || !receiverEmail) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Transfer to ${receiverEmail}`,
            },
            unit_amount: amount * 100, // Stripe accepts paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/transaction-success',
cancel_url: 'http://localhost:5173/send-money',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

module.exports = router;
