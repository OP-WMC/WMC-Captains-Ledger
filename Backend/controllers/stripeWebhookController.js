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
    // console.log("📦 Metadata inside webhook:", session.metadata);

    const metadata = session.metadata;

    try {
       // ✅ CHECK if already handled
    const existingTransaction = await Transaction.findOne({ stripeSessionId: session.id });
    if (existingTransaction) {
      console.log("⚠️ Transaction already processed.");
      return res.status(200).json({ message: "Transaction already processed." });
    }

      // Support multiple recipients
      let receiverEmails = metadata.receiverEmails;
      if (!receiverEmails) {
        receiverEmails = metadata.receiverEmail ? [metadata.receiverEmail] : [];
      } else {
        receiverEmails = receiverEmails.split(",").map(e => e.trim());
      }

      const sender = await User.findOne({ email: metadata.senderEmail });
      if (!sender) {
        console.log("❌ Sender not found.");
        return res.status(404).send("Sender not found.");
      }

      const amount = session.amount_total / 100;
      
      // Get split type and manual amounts
      const splitType = metadata.splitType || "equal";
      const manualAmounts = metadata.manualAmounts ? JSON.parse(metadata.manualAmounts) : {};
      
      // Calculate per recipient amount based on split type
      let perRecipientAmount = receiverEmails.length > 0 ? amount / receiverEmails.length : 0;
      
      // Check if this is advanced money mode
      const isAdvancedMode = metadata.isAdvancedMode === "true";
      const advancedAmount = isAdvancedMode ? parseFloat(metadata.advancedAmount) / receiverEmails.length : 0;
      const remainingAmount = isAdvancedMode ? parseFloat(metadata.remainingAmount) / receiverEmails.length : 0;

      let errors = [];
      for (const receiverEmail of receiverEmails) {
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
          errors.push(`Receiver not found: ${receiverEmail}`);
          continue;
        }

        // Calculate amount for this specific recipient
        let recipientAmount = perRecipientAmount; // Default equal split
        if (splitType === "manual" && manualAmounts[receiver._id]) {
          recipientAmount = parseInt(manualAmounts[receiver._id]);
        }

        let transferAmount = recipientAmount;
        let transactionStatus = "completed";
        let advancedAmountField = 0;
        let remainingAmountField = 0;
        let isAdvancedModeField = false;
        let approvalStatus = "pending";

        if (isAdvancedMode) {
          // Advanced money mode: transfer advanced amount immediately
          // For manual split, calculate advanced amount proportionally
          if (splitType === "manual") {
            const totalManualAmount = Object.values(manualAmounts).reduce((sum, amt) => sum + parseInt(amt), 0);
            const advancedProportion = parseFloat(metadata.advancedAmount) / totalManualAmount;
            transferAmount = Math.round(recipientAmount * advancedProportion);
            advancedAmountField = transferAmount;
            remainingAmountField = recipientAmount - transferAmount;
          } else {
            transferAmount = advancedAmount;
            advancedAmountField = advancedAmount;
            remainingAmountField = remainingAmount;
          }
          isAdvancedModeField = true;
          transactionStatus = remainingAmountField > 0 ? "partially_completed" : "completed";
        }

        if (sender.balance < transferAmount) {
          errors.push(`Insufficient balance for: ${receiverEmail}`);
          continue;
        }

        sender.balance -= transferAmount;
        receiver.balance += transferAmount;
        await sender.save();
        await receiver.save();

        const transaction = await Transaction.create({
          sender: sender._id,
          receiver: receiver._id,
          amount: recipientAmount, // Total amount for this recipient
          advancedAmount: advancedAmountField,
          remainingAmount: remainingAmountField,
          isAdvancedMode: isAdvancedModeField,
          approvalStatus: approvalStatus,
          status: transactionStatus,
          stripeSessionId: session.id,
        });

        // Send email to receiver
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
                .feedback { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .advanced { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
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
                    <p><strong>Total Amount:</strong> ₹${recipientAmount}</p>
                    <p><strong>Amount Received:</strong> ₹${transferAmount}</p>
                    ${isAdvancedMode && remainingAmountField > 0 ? `<p><strong>Pending Amount:</strong> ₹${remainingAmountField} (awaiting approval)</p>` : ''}
                    ${splitType === "manual" ? `<p><strong>Split Type:</strong> Manual Split</p>` : ''}
                    <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  ${isAdvancedMode && remainingAmountField > 0 ? `
                    <div class="advanced">
                      <h4>⚠️ Advanced Payment Mode</h4>
                      <p>You have received ₹${transferAmount} immediately. The remaining ₹${remainingAmountField} will be transferred after mission completion and admin approval.</p>
                    </div>
                  ` : ''}
                  
                  ${metadata.feedback ? `
                    <div class="feedback">
                      <h4>Message from ${sender.name}:</h4>
                      <p><em>"${metadata.feedback}"</em></p>
                    </div>
                  ` : ''}
                  
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
          `
        });
        // Send email to sender
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
                .feedback { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .advanced { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
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
                    <p><strong>Total Amount:</strong> ₹${perRecipientAmount}</p>
                    <p><strong>Amount Sent:</strong> ₹${transferAmount}</p>
                    ${isAdvancedMode && remainingAmount > 0 ? `<p><strong>Pending Amount:</strong> ₹${remainingAmount} (awaiting approval)</p>` : ''}
                    <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  ${isAdvancedMode && remainingAmount > 0 ? `
                    <div class="advanced">
                      <h4>⚠️ Advanced Payment Mode</h4>
                      <p>You have sent ₹${transferAmount} immediately. The remaining ₹${remainingAmount} will be transferred after mission completion and your approval.</p>
                    </div>
                  ` : ''}
                  
                  ${metadata.feedback ? `
                    <div class="feedback">
                      <h4>Message sent to ${receiver.name}:</h4>
                      <p><em>"${metadata.feedback}"</em></p>
                    </div>
                  ` : ''}
                  
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
          `
        });
      }
      if (errors.length > 0) {
        console.log("Some transfers failed:", errors);
        return res.status(207).json({ message: "Some transfers failed", errors });
      }
      return res.status(200).json({ message: "All transfers completed successfully" });
    } catch (err) {
      console.error("❌ Error processing webhook:", err.message);
    }
  }

  res.json({ received: true });
};