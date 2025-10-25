const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GroupChat = require('../models/GroupChat');
const GroupMember = require('../models/GroupMember');

// Send a message to group
router.post('/:groupId', auth, async (req, res) => {
  try {
    const { message_content, message_type, file_base64 } = req.body;

    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      group_id: req.params.groupId,
      user_id: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const message = new GroupChat({
      group_id: req.params.groupId,
      sender_id: req.user._id,
      message_content,
      message_type,
      file_base64
    });

    await message.save();

    // Populate sender details
    await message.populate('sender_id', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a group
router.get('/:groupId', auth, async (req, res) => {
  try {
    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      group_id: req.params.groupId,
      user_id: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await GroupChat.find({ group_id: req.params.groupId })
      .populate('sender_id', 'name email')
      .sort({ sent_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GroupChat.countDocuments({ group_id: req.params.groupId });

    res.json({
      messages,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_messages: total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a message
router.delete('/:groupId/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await GroupChat.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or an admin/moderator
    const membership = await GroupMember.findOne({
      group_id: req.params.groupId,
      user_id: req.user._id
    });

    if (!membership || 
        (membership.role === 'member' && message.sender_id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.remove();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;