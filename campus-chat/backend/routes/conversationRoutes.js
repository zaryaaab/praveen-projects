const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const UserBlock = require('../models/UserBlock');

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const { type, name, participants } = req.body;
    const userId = req.user.userId;

    // Check if direct chat already exists between these users
    if (type === 'direct' && participants.length === 1) {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        'participants.user': { $all: [userId, participants[0]] }
      }).populate('participants.user', 'name email');

      if (existingConversation) {
        // Return the existing conversation instead of an error
        return res.status(200).json(existingConversation);
      }
    }

    // Check for blocked users
    const blockedUsers = await UserBlock.find({
      $or: [
        { blocker_id: userId, blocked_id: { $in: participants } },
        { blocker_id: { $in: participants }, blocked_id: userId }
      ]
    });

    if (blockedUsers.length > 0) {
      return res.status(400).json({ message: 'Cannot create conversation with blocked users' });
    }

    // Create conversation participants array
    const conversationParticipants = [
      { user: userId, role: 'admin' },
      ...participants.map(participantId => ({
        user: participantId,
        role: 'member'
      }))
    ];

    const conversation = await Conversation.create({
      type,
      name: type === 'group' ? name : undefined,
      created_by: userId,
      participants: conversationParticipants
    });

    await conversation.populate('participants.user', 'name email');
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's conversations
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.find({
      'participants.user': userId,
      'participants.left_at': null
    })
    .populate('participants.user', 'name email')
    .populate({
      path: 'created_by',
      select: 'name email'
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation by ID
router.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': req.user.userId
    })
    .populate('participants.user', 'name email')
    .populate('created_by', 'name email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add participants to group conversation
router.post('/:id/participants', async (req, res) => {
  try {
    const { participants } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      'participants.user': req.user.userId,
      'participants.role': 'admin'
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found or unauthorized' });
    }

    // Add new participants
    const newParticipants = participants.map(participantId => ({
      user: participantId,
      role: 'member'
    }));

    conversation.participants.push(...newParticipants);
    await conversation.save();
    await conversation.populate('participants.user', 'name email');

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leave conversation
router.post('/:id/leave', async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update participant's left_at timestamp
    const participantIndex = conversation.participants.findIndex(
      p => p.user.toString() === userId
    );
    
    if (participantIndex !== -1) {
      conversation.participants[participantIndex].left_at = new Date();
      await conversation.save();
    }

    res.json({ message: 'Left conversation successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mute conversation for the logged-in user
router.post('/:id/mute', async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': userId
    });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const participant = conversation.participants.find(p => p.user.toString() === userId);
    if (participant) {
      participant.is_muted = true;
      await conversation.save();
    }
    res.json({ message: 'Conversation muted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unmute conversation for the logged-in user
router.post('/:id/unmute', async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.user': userId
    });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    const participant = conversation.participants.find(p => p.user.toString() === userId);
    if (participant) {
      participant.is_muted = false;
      await conversation.save();
    }
    res.json({ message: 'Conversation unmuted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;