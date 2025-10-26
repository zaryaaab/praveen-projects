const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  coverImage: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text indexes for search functionality
bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

// Update the updatedAt timestamp before saving
bookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;