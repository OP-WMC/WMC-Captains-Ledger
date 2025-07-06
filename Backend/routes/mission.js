const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');

// GET all missions
router.get('/', async (req, res) => {
  const missions = await Mission.find();
  res.json(missions);
});

// POST create mission
router.post('/', async (req, res) => {
  const mission = new Mission(req.body);
  await mission.save();
  res.status(201).json(mission);
});

// PUT update mission
router.put('/:id', async (req, res) => {
  const updated = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE mission
router.delete('/:id', async (req, res) => {
  await Mission.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
