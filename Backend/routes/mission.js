const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const transactionController = require('../controllers/transactionController');

// GET all missions
router.get('/', authMiddleware, async (req, res) => {
  const missions = await Mission.find();
  res.json(missions);
});

// POST create mission
router.post('/', authMiddleware, async (req, res) => {
  const mission = new Mission(req.body);
  await mission.save();
  res.status(201).json(mission);
});

// PUT update mission
router.put('/:id', authMiddleware, async (req, res) => {
  const updated = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE mission
router.delete('/:id', authMiddleware, async (req, res) => {
  await Mission.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Admin finalizes a mission after end datetime
router.post('/finalize/:id', async (req, res) => {
  try {
    const { status, martyrs, updatedBy } = req.body;
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });
    mission.status = status;
    if (status === 'martyred') {
      mission.martyrs = martyrs || [];
    } else {
      mission.martyrs = [];
    }
    mission.statusHistory = mission.statusHistory || [];
    mission.statusHistory.push({
      status,
      date: new Date().toISOString(),
      updatedBy: updatedBy || 'admin',
    });

    // Auto-reject pending members
    mission.assignedMembers.forEach(member => {
      if (member.status === 'pending') {
        member.status = 'auto-rejected';
      }
    });

    // Remove all non-accepted members
    mission.assignedMembers = mission.assignedMembers.filter(member => member.status === 'accepted');

    // If no accepted members remain, mark as failed and do not pay
    if (mission.assignedMembers.length === 0) {
      mission.status = 'failed';
      mission.salariesPaid = true;
      await mission.save();
      return res.json({ msg: 'Mission failed (no accepted members)', mission });
    }

    // Do NOT pay salaries or set salariesPaid to true here. Allow manual payment after finalization.
    await mission.save();
    res.json({ msg: 'Mission finalized', mission });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Endpoint to create Stripe Checkout for mission salary payment
router.post('/:id/send-salary-stripe', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });
    if (!mission.assignedMembers || mission.assignedMembers.length === 0) {
      return res.status(400).json({ msg: 'No assigned members for this mission' });
    }
    // Calculate total salary
    const totalSalary = mission.assignedMembers.reduce((sum, m) => sum + (m.salary || 0), 0);
    if (totalSalary <= 0) {
      return res.status(400).json({ msg: 'Total salary must be greater than 0' });
    }
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Mission Salary Payment: ${mission.title}`,
            },
            unit_amount: totalSalary * 100,
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:5173/transaction-success',
      cancel_url: 'http://localhost:5173/transaction-cancel',
      metadata: {
        missionId: mission._id.toString(),
        missionTitle: mission.title,
        assignedMembers: JSON.stringify(mission.assignedMembers),
        totalSalary: totalSalary.toString(),
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ msg: 'Stripe error', error: err.message });
  }
});

// Endpoint to send mission salary using the same logic as Send Money
router.post('/:id/send-salary', authMiddleware, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });
    if (mission.salariesPaid) return res.status(400).json({ msg: 'Salaries already paid for this mission' });
    if (!mission.assignedMembers || mission.assignedMembers.length === 0) {
      return res.status(400).json({ msg: 'No assigned members for this mission' });
    }
    // Set salariesPaid to true immediately to prevent race conditions
    mission.salariesPaid = true;
    await mission.save();
    // Find users by name
    const users = await User.find({ name: { $in: mission.assignedMembers.map(m => m.name) } });
    if (!users || users.length === 0) {
      return res.status(400).json({ msg: 'No users found for assigned members' });
    }
    // Build manualAmounts and receiverEmails
    const manualAmounts = {};
    const receiverEmails = [];
    let totalSalary = 0;
    users.forEach(user => {
      const member = mission.assignedMembers.find(m => m.name === user.name);
      if (member && member.salary > 0) {
        manualAmounts[user._id] = member.salary;
        receiverEmails.push(user.email);
        totalSalary += member.salary;
      }
    });
    if (receiverEmails.length === 0) {
      return res.status(400).json({ msg: 'No valid recipients with salary' });
    }
    // Accept advancedAmount and remainingAmount from request body (for advanced mode)
    const { advancedAmount, remainingAmount } = req.body;
    // Call the existing stripe-checkout logic
    req.body = {
      amount: totalSalary,
      receiverEmails,
      feedback: `Mission salary for ${mission.title}`,
      splitType: 'manual',
      manualAmounts,
      missionId: mission._id,
      missionTitle: mission.title,
      advancedAmount,
      remainingAmount,
    };
    // Use the same controller as /transactions/stripe-checkout
    return transactionController.createStripeCheckout(req, res);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Accept a mission assignment (user)
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });

    // Prevent accepting after mission end time
    if (new Date() > new Date(mission.endDate)) {
      return res.status(403).json({ msg: 'Mission has already ended.' });
    }

    // Fetch user from DB to get the name
    const user = await User.findById(req.user._id);
    if (!user) return res.status(403).json({ msg: 'User not found' });

    const userName = user.name;
    const member = mission.assignedMembers.find(m => m.name === userName);
    if (!member) return res.status(403).json({ msg: 'You are not assigned to this mission' });

    member.status = 'accepted';
    member.declineReason = undefined;
    member.declineFile = undefined;
    await mission.save();
    res.json({ msg: 'Mission accepted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Decline a mission assignment (user)
router.post('/:id/decline', authMiddleware, async (req, res) => {
  try {
    const { declineReason, declineFile } = req.body; // declineFile: file path or URL
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });

    // Prevent declining after mission end time
    if (new Date() > new Date(mission.endDate)) {
      return res.status(403).json({ msg: 'Mission has already ended.' });
    }

    // Fetch user from DB to get the name
    const user = await User.findById(req.user._id);
    if (!user) return res.status(403).json({ msg: 'User not found' });

    const userName = user.name;
    const member = mission.assignedMembers.find(m => m.name === userName);
    if (!member) return res.status(403).json({ msg: 'You are not assigned to this mission' });

    member.status = 'declined';
    member.declineReason = declineReason;
    member.declineFile = declineFile;
    await mission.save();
    res.json({ msg: 'Mission declined' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Admin: reassign a member to a mission
router.post('/:id/reassign', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Only admin can reassign members' });
    const { oldMemberName, newMemberName, newMemberSalary } = req.body;
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });
    // Remove old member
    mission.assignedMembers = mission.assignedMembers.filter(m => m.name !== oldMemberName);
    // Add new member
    mission.assignedMembers.push({ name: newMemberName, salary: newMemberSalary, status: 'pending' });
    await mission.save();
    res.json({ msg: 'Member reassigned', mission });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
