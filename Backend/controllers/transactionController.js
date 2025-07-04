const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeCheckout = async (req, res) => {
  try {
    const { amount, receiverEmail } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Send ₹${amount} to ${receiverEmail}`,
            },
            unit_amount: amount * 100, // Stripe uses paise
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/transaction-success",
      cancel_url: "http://localhost:5173/transaction-cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
