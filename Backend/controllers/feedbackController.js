const Feedback = require("../models/Feedback");
const Transaction = require("../models/Transaction");

exports.submitFeedback = async (req, res) => {
  try {
    const { transactionId, rating, comment } = req.body;

    // Check if already submitted
    const existing = await Feedback.findOne({ transactionId });
    if (existing) return res.status(400).json({ error: "Feedback already submitted" });

    const feedback = await Feedback.create({ transactionId, rating, comment });
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
      filter.transactionId = { $in: ids };
    }

    const feedbacks = await Feedback.find(filter).populate("transactionId");
    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

