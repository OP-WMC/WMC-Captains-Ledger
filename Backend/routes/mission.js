const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const transactionController = require('../controllers/transactionController');

// GET all missions
router.get('/', verifyToken, async (req, res) => {
  const missions = await Mission.find();
  res.json(missions);
});

// POST create mission
router.post('/', verifyToken, async (req, res) => {
  const mission = new Mission(req.body);
  await mission.save();
  res.status(201).json(mission);
});

// PUT update mission
router.put('/:id', verifyToken, async (req, res) => {
  const updated = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE mission
router.delete('/:id', verifyToken, async (req, res) => {
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

    // Pay salaries if not already paid and status is completed/martyred/failed
    const logs = [];
    if ((status === 'completed' || status === 'martyred' || status === 'failed') && !mission.salariesPaid) {
      logs.push('Assigned members: ' + JSON.stringify(mission.assignedMembers));
      let errors = [];
      for (const member of mission.assignedMembers) {
        try {
          logs.push(`Looking for user: ${member.name}`);
          const user = await User.findOne({ name: member.name });
          if (user) {
            logs.push(`User found: ${user.name}, current balance: ${user.balance}`);
            user.balance += member.salary || 0;
            await user.save();
            logs.push(`Salary of ${member.salary || 0} added to ${user.name}. New balance: ${user.balance}`);
          } else {
            const errMsg = `User not found: ${member.name}`;
            errors.push(errMsg);
            logs.push(errMsg);
          }
        } catch (e) {
          const errMsg = `Error paying ${member.name}: ${e.message}`;
          errors.push(errMsg);
          logs.push(errMsg);
        }
      }
      mission.salariesPaid = true;
      await mission.save();
      if (errors.length > 0) {
        return res.status(200).json({ msg: 'Mission finalized, but some salaries failed', errors, logs, mission });
      }
    } else {
      await mission.save();
    }
    res.json({ msg: 'Mission finalized', mission, logs });
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
router.post('/:id/send-salary', verifyToken, async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ msg: 'Mission not found' });
    if (!mission.assignedMembers || mission.assignedMembers.length === 0) {
      return res.status(400).json({ msg: 'No assigned members for this mission' });
    }
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

module.exports = router;
