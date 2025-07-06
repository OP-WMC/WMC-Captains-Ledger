const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeCheckout = async (req, res) => {
  try {
    const { amount, receiverEmail } = req.body;

    //  DEBUG: Check req.user
    console.log(" Logged in user:", req.user);
    console.log(" Sender Email:", req.user?.email);

     //  Check wallet balance before allowing payment
    if (req.user.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

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
        senderEmail: req.user?.email,         
        receiverEmail: receiverEmail,
      },

    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
