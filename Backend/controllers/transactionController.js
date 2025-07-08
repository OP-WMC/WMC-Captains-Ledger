// ✅ transactionController.js (UPDATED)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/sendEmail");

exports.createStripeCheckout = async (req, res) => {
  try {
    const { amount, receiverEmail } = req.body;
    console.log("💳 Logged in user:", req.user?.email);

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
        receiverEmail,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe Checkout Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.sendFeedbackMail = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.email) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <h2 style="color: #4CAF50;">🧾 Transaction Feedback</h2>
        <p>Hello ${user.codename || user.name || "Agent"},</p>
        <p>Thank you for completing your recent mission payment using <strong>Captain's Ledger</strong>.</p>
        <p>Please take a moment to share your experience:</p>
        <a href="http://localhost:5173/feedback" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:6px;">
          Fill Feedback Form
        </a>
        <p style="margin-top:20px;color:gray;">This helps us improve our platform and support team efficiency. 🛡️</p>
        <hr />
        <p style="font-size:12px;color:gray;">If you did not initiate this request, you can ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "We value your feedback on the recent transaction 🛡️",
      html,
    });

    res.status(200).json({ message: "Feedback email sent successfully." });
  } catch (err) {
    console.error("❌ Feedback Mail Error:", err);
    res.status(500).json({ error: "Failed to send feedback mail." });
  }
};