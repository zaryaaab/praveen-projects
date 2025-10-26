const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const authenticate = require("../middleware/authenticateToken");

// Create a new activity
router.post('/', authenticate, async (req, res) => {
  try {
    const activity = new Activity({...req.body, userId: req.user.userId});
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all activities
router.get('/', authenticate, async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities from the last 7 days
router.get('/last7days', authenticate, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await Activity.find({
      userId: req.user.userId,
      date: { $gte: sevenDaysAgo }
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;