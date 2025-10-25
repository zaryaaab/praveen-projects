const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notification_type: {
    type: String,
    enum: ['group_invite', 'new_message', 'resource_shared', 'mentorship_request', 'conference_reminder'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  related_entity_type: {
    type: String,
    enum: ['group', 'resource', 'mentorship', 'conference'],
    required: true
  },
  related_entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  read_at: {
    type: Date,
    default: null
  }
});

// Indexes for efficient querying
notificationSchema.index({ recipient_id: 1, created_at: -1 });
notificationSchema.index({ recipient_id: 1, read_at: 1 });

// Virtual property for read status
notificationSchema.virtual('is_read').get(function() {
  return this.read_at != null;
});

module.exports = mongoose.model('Notification', notificationSchema);