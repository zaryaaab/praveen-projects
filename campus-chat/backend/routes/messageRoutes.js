const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const UserBlock = require('../models/UserBlock');

// Send a message
router.post('/', async (req, res) => {
  try {
    const { conversation_id, content, message_type, file_data, reply_to_message_id } = req.body;
    const sender_id = req.user.userId;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversation_id,
      'participants.user': sender_id,
      'participants.left_at': null
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Not authorized to send message in this conversation' });
    }

    // Check for block status between sender and other participants
    const otherParticipantIds = conversation.participants
      .map(p => p.user.toString())
      .filter(id => id !== sender_id);

    // Check if sender is blocked by any participant or has blocked any participant
    const block = await UserBlock.findOne({
      $or: [
        { blocker_id: { $in: otherParticipantIds }, blocked_id: sender_id }, // sender is blocked by someone
        { blocker_id: sender_id, blocked_id: { $in: otherParticipantIds } }  // sender has blocked someone
      ]
    });
    if (block) {
      return res.status(403).json({ message: 'You cannot send messages to this user.' });
    }

    // Create message
    const message = await Message.create({
      conversation_id,
      sender_id,
      content,
      message_type,
      file_data,
      reply_to_message_id,
      read_by: [{ user_id: sender_id }]
    });

    // Create notifications for other participants
    const notifications = conversation.participants
      .filter(p => p.user.toString() !== sender_id && !p.is_muted)
      .map(p => ({
        user_id: p.user,
        type: 'message',
        title: 'New Message',
        content: `New message in ${conversation.name || 'conversation'}`,
        related_id: message._id
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await message.populate([
      { path: 'sender_id', select: 'name email' },
      { path: 'reply_to_message_id', select: 'content' }
    ]);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Find the participant object for the current user
    const participant = conversation.participants.find(p => p.user.toString() === userId);
    let messageFilter = { conversation_id: conversationId };
    if (participant && participant.left_at) {
      // Only show messages sent before or at the time the user left
      messageFilter.created_at = { $lte: participant.left_at };
    }

    const messages = await Message.find(messageFilter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender_id', 'name email')
      .populate('reply_to_message_id', 'content')
      .populate('reactions.user_id', 'name email')
      .populate('read_by.user_id', 'name email');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add reaction to message
router.post('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reaction_type } = req.body;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove existing reaction from same user if exists
    const existingReactionIndex = message.reactions.findIndex(
      r => r.user_id.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      message.reactions.splice(existingReactionIndex, 1);
    }

    // Add new reaction
    message.reactions.push({
      user_id: userId,
      reaction_type
    });

    await message.save();
    await message.populate('reactions.user_id', 'name email');

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove reaction from message
router.delete('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove reaction
    message.reactions = message.reactions.filter(
      reaction => reaction.user_id.toString() !== userId
    );

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark message as read
router.post('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Add read status if not already present
    if (!message.read_by.some(r => r.user_id.toString() === userId)) {
      message.read_by.push({
        user_id: userId
      });
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Edit message
router.put('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const message = await Message.findOne({
      _id: messageId,
      sender_id: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.content = content;
    message.is_edited = true;
    message.edited_at = new Date();

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;