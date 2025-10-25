const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MentorshipProgram = require('../models/MentorshipProgram');
const User = require('../models/User');

// Create a mentorship program request
router.post('/request', auth, async (req, res) => {
  try {
    const {
      mentor_id,
      skill_area,
      program_description,
      duration_weeks,
      start_date,
      end_date
    } = req.body;

    // Check if mentor exists
    const mentor = await User.findById(mentor_id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Prevent self-mentorship
    if (mentor_id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot request mentorship from yourself' });
    }

    // Check for existing active mentorship
    const existingMentorship = await MentorshipProgram.findOne({
      mentor_id,
      mentee_id: req.user._id,
      status: { $in: ['pending', 'active'] }
    });

    if (existingMentorship) {
      return res.status(400).json({ message: 'Active or pending mentorship already exists' });
    }

    const mentorship = new MentorshipProgram({
      mentor_id,
      mentee_id: req.user._id,
      skill_area,
      program_description,
      duration_weeks,
      start_date,
      end_date
    });

    await mentorship.save();
    await mentorship.populate(['mentor_id', 'mentee_id'], 'name email');

    res.status(201).json(mentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all mentorship programs (as mentor or mentee)
router.get('/', auth, async (req, res) => {
  try {
    const mentorships = await MentorshipProgram.find({
      $or: [
        { mentor_id: req.user._id },
        { mentee_id: req.user._id }
      ]
    })
    .populate(['mentor_id', 'mentee_id'], 'name email')
    .sort({ created_at: -1 });

    res.json(mentorships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update mentorship status (accept/reject/cancel)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const mentorship = await MentorshipProgram.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Verify user is mentor or mentee
    if (![mentorship.mentor_id.toString(), mentorship.mentee_id.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[mentorship.status].includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    // Only mentor can accept/reject
    if (status === 'active' && mentorship.mentor_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only mentor can accept mentorship requests' });
    }

    mentorship.status = status;
    mentorship.updated_at = Date.now();

    await mentorship.save();
    await mentorship.populate(['mentor_id', 'mentee_id'], 'name email');

    res.json(mentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mentorship program details
router.get('/:id', auth, async (req, res) => {
  try {
    const mentorship = await MentorshipProgram.findById(req.params.id)
      .populate(['mentor_id', 'mentee_id'], 'name email');

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship program not found' });
    }

    // Verify user is mentor or mentee
    if (![mentorship.mentor_id.toString(), mentorship.mentee_id.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(mentorship);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;