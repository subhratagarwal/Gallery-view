const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
  