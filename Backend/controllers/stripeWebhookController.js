const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/sendEmail");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
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

    try {
      const sender = await User.findOne({ email: metadata.senderEmail });
      const receiver = await User.findOne({ email: metadata.receiverEmail });

      if (!sender || !receiver) {
        console.log("❌ Sender or receiver not found.");
        return res.status(404).send("User not found.");
      }

      const amount = session.amount_total / 100;

      if (sender.balance < amount) {
        console.log("❌ Insufficient balance.");
        return res.status(400).send("Insufficient balance");
      }

      sender.balance -= amount;
      receiver.balance += amount;
      await sender.save();
      await receiver.save();

      const transaction = await Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount: amount,
        status: "completed",
      });

      console.log("✅ Transaction saved to DB");

      // Send email to receiver with internal feedback link
      await sendEmail({
        to: receiver.email,
        subject: "You received a payment in Captain's Ledger",
        html: `
          <h2>💰 Payment Received</h2>
          <p><strong>From:</strong> ${sender.name}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Reason:</strong> Mission fund transfer</p>
          <p><strong>Transaction ID:</strong> ${transaction._id}</p>
          <p>We'd love your feedback!</p>
          <a href="http://localhost:5173/feedback/${transaction._id}" style="color:blue;">
            ➡️ Click here to submit feedback
          </a>
        `,
      });

      console.log("📧 Email sent to receiver");
    } catch (err) {
      console.error("❌ Error processing webhook:", err.message);
    }
  }

  res.json({ received: true });
};