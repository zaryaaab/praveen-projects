const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joined_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate memberships
groupMemberSchema.index({ group_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('GroupMember', groupMemberSchema);