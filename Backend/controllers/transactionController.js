// ✅ transactionController.js (UPDATED)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/sendEmail");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.createStripeCheckout = async (req, res) => {
  try {
    const { amount, receiverEmails, feedback, advancedAmount, remainingAmount, splitType, manualAmounts } = req.body;
    console.log("💳 Logged in user:", req.user?.email);

    if (req.user.balance < amount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Support both single and multiple recipients for backward compatibility
    let emails = receiverEmails;
    if (!Array.isArray(receiverEmails)) {
      emails = [receiverEmails];
    }

    // Validate advanced money mode
    const isAdvancedMode = advancedAmount && remainingAmount;
    if (isAdvancedMode && (parseInt(advancedAmount) + parseInt(remainingAmount) !== parseInt(amount))) {
      return res.status(400).json({ message: "Advanced amount + remaining amount must equal total amount" });
    }

    // Restrict advanced money mode to admin only
    if (isAdvancedMode && !req.user.isAdmin) {
      return res.status(403).json({ message: "Only admins can use Advanced Money Mode." });
    }

    // Validate manual split amounts if in manual mode
    if (splitType === "manual" && manualAmounts) {
      const totalManualAmount = Object.values(manualAmounts).reduce((sum, amount) => {
        return sum + (parseInt(amount) || 0);
      }, 0);
      
      if (totalManualAmount !== parseInt(amount)) {
        return res.status(400).json({ message: `Manual amounts total (₹${totalManualAmount}) must equal total amount (₹${amount})` });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Send ₹${amount} to ${emails.join(", ")}${isAdvancedMode ? ' (Advanced Mode)' : ''}${splitType === "manual" ? ' (Manual Split)' : ''}`,
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
        receiverEmails: emails.join(","), // comma-separated for webhook
        feedback: feedback || "", // Add feedback to metadata
        advancedAmount: advancedAmount || "0", // Add advanced amount
        remainingAmount: remainingAmount || "0", // Add remaining amount
        isAdvancedMode: isAdvancedMode ? "true" : "false", // Add advanced mode flag
        splitType: splitType || "equal", // Add split type
        manualAmounts: manualAmounts ? JSON.stringify(manualAmounts) : "", // Add manual amounts as JSON string
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

// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const allUsers = await User.find({ role: "user" }).select("name email codename");
    
    // Get all transactions
    const allTransactions = await Transaction.find({}).populate("sender", "name email codename").populate("receiver", "name email codename");
    
    // Calculate payment statistics for each user
    const userPaymentStats = allUsers.map(user => {
      const sentTransactions = allTransactions.filter(t => 
        t.sender && t.sender._id.toString() === user._id.toString()
      );
      const receivedTransactions = allTransactions.filter(t => 
        t.receiver && t.receiver._id.toString() === user._id.toString()
      );
      
      const totalSent = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalReceived = receivedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const netAmount = totalReceived - totalSent;
      
      return {
        userId: user._id,
        name: user.name || user.codename || user.email,
        email: user.email,
        codename: user.codename,
        totalSent,
        totalReceived,
        netAmount,
        sentCount: sentTransactions.length,
        receivedCount: receivedTransactions.length,
        lastTransaction: allTransactions.length > 0 ? 
          new Date(Math.max(...allTransactions.map(t => new Date(t.createdAt)))) : null
      };
    });
    
    // Calculate overall statistics
    const totalTransactions = allTransactions.length;
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0;
    
    res.json({
      totalTransactions,
      totalAmount,
      averageAmount,
      userPaymentStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get payment trends over time (admin only)
exports.getPaymentTrends = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days) + 1); // include today

    // Get transactions within date range (use 'timestamp' instead of 'createdAt')
    const transactions = await Transaction.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).populate("sender", "name email codename").populate("receiver", "name email codename");

    // Initialize daily stats for ALL days (even if no transactions)
    const dailyStats = {};
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (parseInt(days) - 1 - i));
      const dateKey = date.toLocaleDateString("en-CA");
      dailyStats[dateKey] = {
        date: dateKey,
        totalAmount: 0,
        transactionCount: 0,
        sentAmount: 0,
        receivedAmount: 0
      };
    }

    // Group transactions by date (use 'timestamp')
    transactions.forEach(transaction => {
      const date = new Date(transaction.timestamp).toLocaleDateString("en-CA");
      if (!dailyStats[date]) return; // skip if out of range
      dailyStats[date].totalAmount += transaction.amount;
      dailyStats[date].transactionCount++;
      if (transaction.status === 'completed') {
        dailyStats[date].receivedAmount += transaction.amount;
      }
    });

    // Convert to array and sort by date
    const trends = Object.values(dailyStats)
      .map(stat => ({
        ...stat,
        averageAmount: stat.transactionCount > 0 ? Math.round(stat.totalAmount / stat.transactionCount) : 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Approve remaining amount for advanced money mode (admin only)
exports.approveRemainingAmount = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId)
      .populate("sender", "name email balance")
      .populate("receiver", "name email balance");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!transaction.isAdvancedMode) {
      return res.status(400).json({ message: "This transaction is not in advanced mode" });
    }

    if (transaction.approvalStatus !== "pending") {
      return res.status(400).json({ message: "Transaction has already been processed" });
    }

    if (transaction.remainingAmount <= 0) {
      return res.status(400).json({ message: "No remaining amount to approve" });
    }

    // Check if sender has sufficient balance
    if (transaction.sender.balance < transaction.remainingAmount) {
      return res.status(400).json({ message: "Insufficient balance to approve remaining amount" });
    }

    // Transfer remaining amount
    transaction.sender.balance -= transaction.remainingAmount;
    transaction.receiver.balance += transaction.remainingAmount;
    transaction.approvalStatus = "approved";
    transaction.status = "completed";

    await transaction.sender.save();
    await transaction.receiver.save();
    await transaction.save();

    // Send email notifications
    await sendEmail({
      to: transaction.receiver.email,
      subject: "Remaining Payment Approved - Captain's Ledger",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Approved</h1>
              <p>Captain's Ledger Transaction Update</p>
            </div>
            <div class="content">
              <h2>Hello ${transaction.receiver.name},</h2>
              <p>Great news! The remaining amount from your advanced payment has been approved and transferred to your account.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3>Transaction Details:</h3>
                <p><strong>From:</strong> ${transaction.sender.name}</p>
                <p><strong>Remaining Amount Approved:</strong> ₹${transaction.remainingAmount}</p>
                <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                <p><strong>Approval Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Your account balance has been updated with the remaining amount.</p>
              
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

    await sendEmail({
      to: transaction.sender.email,
      subject: "Remaining Payment Released - Captain's Ledger",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Released</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💸 Payment Released</h1>
              <p>Captain's Ledger Transaction Update</p>
            </div>
            <div class="content">
              <h2>Hello ${transaction.sender.name},</h2>
              <p>The remaining amount from your advanced payment has been approved and released to the recipient.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3>Transaction Details:</h3>
                <p><strong>To:</strong> ${transaction.receiver.name}</p>
                <p><strong>Remaining Amount Released:</strong> ₹${transaction.remainingAmount}</p>
                <p><strong>Transaction ID:</strong> ${transaction._id}</p>
                <p><strong>Release Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Your account balance has been updated accordingly.</p>
              
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

    res.json({ 
      message: "Remaining amount approved successfully",
      transaction: {
        id: transaction._id,
        remainingAmount: transaction.remainingAmount,
        status: transaction.status,
        approvalStatus: transaction.approvalStatus
      }
    });

  } catch (err) {
    console.error("❌ Approve Remaining Amount Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get pending advanced transactions (admin only)
exports.getPendingAdvancedTransactions = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const pendingTransactions = await Transaction.find({
      isAdvancedMode: true,
      approvalStatus: "pending",
      remainingAmount: { $gt: 0 }
    })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: -1 });

    res.json(pendingTransactions);

  } catch (err) {
    console.error("❌ Get Pending Transactions Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get payment stats for dashboard (all users, just total payments)
exports.getPaymentStatsForUser = async (req, res) => {
  try {
    // Get all transactions
    const allTransactions = await Transaction.find({});
    const totalTransactions = allTransactions.length;
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalTransactions > 0 ? Math.round(totalAmount / totalTransactions) : 0;
    res.json({
      totalTransactions,
      totalAmount,
      averageAmount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get payment stats for the logged-in user (user dashboard)
exports.getUserPaymentStats = async (req, res) => {
  try {
    const userId = req.user._id;
    // Get all transactions where user is sender or receiver
    const sentTransactions = await Transaction.find({ sender: userId });
    const receivedTransactions = await Transaction.find({ receiver: userId });
    const totalSent = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalReceived - totalSent;
    res.json({
      totalSent,
      totalReceived,
      netAmount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};