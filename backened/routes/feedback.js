const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Submit feedback
router.post('/', async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message) {
    return res.status(400).json({ error: 'Username and message are required.' });
  }
  try {
    const feedback = await Feedback.create({ username, message });
    res.status(201).json(feedback);
  } catch {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
