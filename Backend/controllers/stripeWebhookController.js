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
        subject: "Payment Received - Captain's Ledger",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Received</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9fafb; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Payment Received</h1>
                <p>Captain's Ledger Transaction Notification</p>
              </div>
              <div class="content">
                <h2>Hello ${receiver.name},</h2>
                <p>You have received a payment in your Captain's Ledger account.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <h3>Transaction Details:</h3>
                  <p><strong>From:</strong> ${sender.name}</p>
                  <p><strong>Amount:</strong> ₹${amount}</p>
                  <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <p>Your new balance has been updated in your account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:5173/feedback/${transaction._id}" class="button">
                    📝 Submit Feedback
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">
                  <strong>Note:</strong> Please submit feedback for this transaction.
                  This helps us improve our timely payment service.
                </p>
                
                <p style="font-size: 14px; color: #6b7280;">
                  This is an automated notification from Captain's Ledger. 
                  Please do not reply to this email.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Captain's Ledger. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      // Send email to sender with feedback link
      await sendEmail({
        to: sender.email,
        subject: "Payment Sent - Captain's Ledger",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Sent</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9fafb; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💸 Payment Sent</h1>
                <p>Captain's Ledger Transaction Notification</p>
              </div>
              <div class="content">
                <h2>Hello ${sender.name},</h2>
                <p>Your payment has been successfully sent.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3>Transaction Details:</h3>
                  <p><strong>To:</strong> ${receiver.name}</p>
                  <p><strong>Amount:</strong> ₹${amount}</p>
                  <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <p>Your new balance has been updated in your account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:5173/feedback" class="button">
                    👁️ View Feedback
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">
                  <strong>Note:</strong> Receiver has submitted feedback for this transaction.
                  You can view feedback for this transaction.
                </p>
                
                <p style="font-size: 14px; color: #6b7280;">
                  This is an automated notification from Captain's Ledger. 
                  Please do not reply to this email.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Captain's Ledger. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("📧 Email sent to receiver");
      console.log("📧 Email sent to sender");
    } catch (err) {
      console.error("❌ Error processing webhook:", err.message);
    }
  }

  res.json({ received: true });
};