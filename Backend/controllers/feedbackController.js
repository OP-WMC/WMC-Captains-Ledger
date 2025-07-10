const Feedback = require("../models/Feedback");
const Transaction = require("../models/Transaction");

exports.submitFeedback = async (req, res) => {
  try {
    const { transactionId, rating, comment } = req.body;
    const userId = req.user._id;
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    // Allow both sender and receiver to submit feedback
    if (String(transaction.sender) !== String(userId) && String(transaction.receiver) !== String(userId)) {
      return res.status(403).json({ error: "You are not allowed to submit feedback for this transaction." });
    }

    // Only allow one feedback per transaction per user
    const existing = await Feedback.findOne({ transactionId, user: userId });
    if (existing) return res.status(400).json({ error: "Feedback already submitted" });

    const feedback = await Feedback.create({ transactionId, rating, comment, user: userId });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};
    if (user.role !== "admin") {
      const txns = await Transaction.find({
        $or: [{ sender: user._id }, { receiver: user._id }],
      });
      const ids = txns.map(t => t._id);
      filter = { $or: [
        { transactionId: { $in: ids } },
        { user: user._id }
      ]};
    }
    // Populate both transaction and user fields
    const feedbacks = await Feedback.find(filter)
      .populate("transactionId")
      .populate("user", "name codename email");
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

