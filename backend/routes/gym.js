const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');

// GET gym details
router.get('/', async (req, res) => {
  try {
    const gym = await Gym.findOne();
    if (!gym) return res.status(404).json({ error: 'Gym details not found' });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create gym
router.post('/', async (req, res) => {
  try {
    const gym = new Gym(req.body);
    await gym.save();
    res.status(201).json(gym);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update gym
router.put('/:id', async (req, res) => {
  try {
    const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!gym) return res.status(404).json({ error: 'Gym not found' });
    res.json(gym);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE gym
router.delete('/:id', async (req, res) => {
  try {
    const gym = await Gym.findByIdAndDelete(req.params.id);
    if (!gym) return res.status(404).json({ error: 'Gym not found' });
    res.json({ message: 'Gym deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
