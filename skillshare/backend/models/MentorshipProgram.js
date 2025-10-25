const mongoose = require('mongoose');

const mentorshipProgramSchema = new mongoose.Schema({
  mentor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill_area: {
    type: String,
    required: true,
    trim: true
  },
  program_description: {
    type: String,
    required: true,
    trim: true
  },
  duration_weeks: {
    type: Number,
    required: true,
    min: 1
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate mentorship relationships
mentorshipProgramSchema.index({ mentor_id: 1, mentee_id: 1, status: 1 }, { unique: true });

// Update timestamp before saving
mentorshipProgramSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Validate end date is after start date
mentorshipProgramSchema.pre('validate', function(next) {
  if (this.end_date <= this.start_date) {
    next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('MentorshipProgram', mentorshipProgramSchema);