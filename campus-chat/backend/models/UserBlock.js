const mongoose = require('mongoose');

const userBlockSchema = new mongoose.Schema({
  blocker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blocked_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can't block another user multiple times
userBlockSchema.index({ blocker_id: 1, blocked_id: 1 }, { unique: true });

module.exports = mongoose.model('UserBlock', userBlockSchema);