const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeCheckout = async (req, res) => {
  try {
    const { amount, receiverEmail } = req.body;

    // ✅ DEBUG: Check req.user
    console.log("✅ Logged in user:", req.user);
    console.log("✅ Sender Email:", req.user?.email);

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
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173/transaction-success",
      cancel_url: "http://localhost:5173/transaction-cancel",

      
      metadata: {
        senderEmail: req.user?.email,         // ✅ MUST be defined
        receiverEmail: receiverEmail,
      },

    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
