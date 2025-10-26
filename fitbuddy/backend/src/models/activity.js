const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  steps: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sleep: {
    type: Number,
    required: true
  },
  workout: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Activity', activitySchema);