const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const verifyToken = require('../middleware/verifyToken');

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

module.exports = router;
