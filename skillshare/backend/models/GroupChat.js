const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message_content: {
    type: String,
    required: true,
    trim: true
  },
  message_type: {
    type: String,
    enum: ['text', 'file', 'image', 'video'],
    default: 'text'
  },
  file_base64: {
    type: String,
    required: function() {
      return ['file', 'image', 'video'].includes(this.message_type);
    }
  },
  sent_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of messages by group
groupChatSchema.index({ group_id: 1, sent_at: -1 });

module.exports = mongoose.model('GroupChat', groupChatSchema);