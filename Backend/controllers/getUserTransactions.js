const Transaction = require("../models/Transaction");

exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // must be ObjectId from token

    console.log("🔎 Logged-in user ID:", userId);

    const transactions = await Transaction.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate("sender", "name email _id")
      .populate("receiver", "name email _id")
      .sort({ timestamp: -1 });

    console.log("✅ Found transactions:", transactions.length);
    res.json(transactions);
  } catch (err) {
    console.error("❌ Error fetching transactions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
