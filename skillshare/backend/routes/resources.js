const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resource = require('../models/Resource');
const GroupMember = require('../models/GroupMember');

// Upload a new resource
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, file_base64, group_id, category, tags } = req.body;

    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      group_id,
      user_id: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const resource = new Resource({
      title,
      description,
      file_base64,
      uploaded_by: req.user._id,
      group_id,
      category,
      tags: tags || []
    });

    await resource.save();

    // Populate uploader details
    await resource.populate('uploaded_by', 'name email');

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resources for a group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      group_id: req.params.groupId,
      user_id: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const { category, tags } = req.query;
    const query = { group_id: req.params.groupId };

    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };

    const resources = await Resource.find(query)
      .populate('uploaded_by', 'name email')
      .sort({ uploaded_at: -1 });

    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific resource
router.get('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploaded_by', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is a member of the group
    const membership = await GroupMember.findOne({
      group_id: resource.group_id,
      user_id: req.user._id
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not authorized to view this resource' });
    }

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a resource
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is the uploader or an admin/moderator
    const membership = await GroupMember.findOne({
      group_id: resource.group_id,
      user_id: req.user._id
    });

    if (!membership || 
        (membership.role === 'member' && resource.uploaded_by.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    resource.title = title || resource.title;
    resource.description = description || resource.description;
    resource.category = category || resource.category;
    resource.tags = tags || resource.tags;
    resource.updated_at = Date.now();

    await resource.save();
    await resource.populate('uploaded_by', 'name email');

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is the uploader or an admin/moderator
    const membership = await GroupMember.findOne({
      group_id: resource.group_id,
      user_id: req.user._id
    });

    if (!membership || 
        (membership.role === 'member' && resource.uploaded_by.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await resource.remove();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;