const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  file_base64: {
    type: String,
    required: true
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploaded_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
resourceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for efficient querying
resourceSchema.index({ group_id: 1, uploaded_at: -1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ category: 1 });

module.exports = mongoose.model('Resource', resourceSchema);