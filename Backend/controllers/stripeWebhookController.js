const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Transaction = require("../models/Transaction");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                      // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔔 Stripe event received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
  console.log("✅ Checkout complete session:", session);
  console.log("📦 Metadata inside webhook:", session.metadata);
    const metadata = session.metadata;

    console.log("✅ Checkout complete for:", metadata);

    try {
      const sender = await User.findOne({ email: metadata.senderEmail });
      const receiver = await User.findOne({ email: metadata.receiverEmail });

      if (!sender || !receiver) {
        console.log("❌ Sender or receiver not found.");
        return res.status(404).send("User not found.");
      }

      await Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount: session.amount_total / 100,
        status: "completed",
      });

      console.log("✅ Transaction saved to DB");
    } catch (err) {
      console.error("❌ DB save error:", err.message);
    }
  }

  res.json({ received: true });
};
