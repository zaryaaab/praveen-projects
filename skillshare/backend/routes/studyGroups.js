const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StudyGroup = require('../models/StudyGroup');
const GroupMember = require('../models/GroupMember');

// Create a new study group
router.post('/', auth, async (req, res) => {
  try {
    const { group_name, description, category } = req.body;

    const studyGroup = new StudyGroup({
      group_name,
      description,
      category,
      created_by: req.user._id
    });

    await studyGroup.save();

    // Add creator as admin member
    const groupMember = new GroupMember({
      group_id: studyGroup._id,
      user_id: req.user._id,
      role: 'admin'
    });

    await groupMember.save();

    res.status(201).json(studyGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all study groups
router.get('/', auth, async (req, res) => {
  try {
    const studyGroups = await StudyGroup.find()
      .populate('created_by', 'name email')
      .sort({ created_at: -1 });

    res.json(studyGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id)
      .populate('created_by', 'name email');

    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    res.json(studyGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update study group
router.put('/:id', auth, async (req, res) => {
  try {
    const { group_name, description, category } = req.body;

    // Check if user is admin
    const membership = await GroupMember.findOne({
      group_id: req.params.id,
      user_id: req.user._id,
      role: 'admin'
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not authorized to update group' });
    }

    const studyGroup = await StudyGroup.findByIdAndUpdate(
      req.params.id,
      {
        group_name,
        description,
        category,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    res.json(studyGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete study group
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const membership = await GroupMember.findOne({
      group_id: req.params.id,
      user_id: req.user._id,
      role: 'admin'
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not authorized to delete group' });
    }

    const studyGroup = await StudyGroup.findByIdAndDelete(req.params.id);

    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    // Delete all related group members
    await GroupMember.deleteMany({ group_id: req.params.id });

    res.json({ message: 'Study group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join study group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const studyGroup = await StudyGroup.findById(req.params.id);
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      group_id: req.params.id,
      user_id: req.user._id
    });

    if (existingMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    const groupMember = new GroupMember({
      group_id: req.params.id,
      user_id: req.user._id,
      role: 'member'
    });

    await groupMember.save();

    res.status(201).json(groupMember);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;