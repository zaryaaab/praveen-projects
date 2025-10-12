const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file'],
    required: true
  },
  file_data: {
    type: String
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date
  },
  reply_to_message_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction_type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow']
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  read_by: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Message', messageSchema);