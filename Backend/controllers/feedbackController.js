// Backend/controllers/feedbackController.js
// Handles feedback-related operations, including submission, retrieval, and deletion.

const Feedback = require("../models/Feedback");
const Transaction = require("../models/Transaction"); // Used for filtering feedback by user's transactions

exports.submitFeedback = async (req, res) => {
  try {
    const { transactionId, rating, comment } = req.body;
    const userId = req.user._id; // Assuming req.user._id is available from authMiddleware

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
    const user = req.user; // Assuming req.user is populated by authMiddleware
    let filter = {};

    // If the user is NOT an admin, filter feedbacks relevant to them
    if (!user.isAdmin) {
      // Find all transactions where the user is either sender or receiver
      const txns = await Transaction.find({
        $or: [{ sender: user._id }, { receiver: user._id }],
      });
      const transactionIds = txns.map(t => t._id); // Get IDs of these transactions

      // Filter feedback to include:
      // 1. Feedback related to transactions the user was part of
      // 2. Feedback submitted by the user themselves
      filter = { $or: [
        { transactionId: { $in: transactionIds } },
        { user: user._id }
      ]};
    }

    // Populate necessary fields for display on the frontend
    const feedbacks = await Feedback.find(filter)
      .populate({
        path: "transactionId",
        populate: {
          path: "sender", // Populate the sender details within the transaction
          select: "name codename email" // Select specific fields to return
        }
      })
      .populate("user", "name codename email") // Populate the user who submitted the feedback
      .sort({ submittedAt: -1 }); // Sort by newest first

    res.json(feedbacks);
  } catch (err) {
    console.error("Fetch feedbacks error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW: @desc    Delete a feedback
// NEW: @route   DELETE /feedback/:id
// NEW: @access  Private/Admin
exports.deleteFeedback = async (req, res) => {
  try {
    // Check if the authenticated user is an admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied: Not an administrator' });
    }

    const feedback = await Feedback.findById(req.params.id);

    // If feedback not found
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }

    // Delete the feedback from the database
    await feedback.deleteOne(); // Use deleteOne() for Mongoose 6.x and later

    res.json({ msg: 'Feedback removed successfully' }); // Send a success message
  } catch (err) {
    console.error(err.message);
    // Handle CastError if the provided ID is not a valid MongoDB ObjectId format
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid feedback ID format' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};
