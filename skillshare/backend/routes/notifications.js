const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient_id: req.user._id })
      .populate('sender_id', 'name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient_id: req.user._id });
    const unread = await Notification.countDocuments({
      recipient_id: req.user._id,
      read_at: null
    });

    res.json({
      notifications,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_notifications: total,
        unread_count: unread
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient_id: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.read_at) {
      notification.read_at = new Date();
      await notification.save();
    }

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient_id: req.user._id,
        read_at: null
      },
      {
        read_at: new Date()
      }
    );

    res.json({
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient_id: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.remove();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notification (internal use only)
const createNotification = async ({
  recipient_id,
  sender_id,
  notification_type,
  title,
  message,
  related_entity_type,
  related_entity_id
}) => {
  try {
    const notification = new Notification({
      recipient_id,
      sender_id,
      notification_type,
      title,
      message,
      related_entity_type,
      related_entity_id
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  router,
  createNotification
};