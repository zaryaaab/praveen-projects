const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'cancelled', 'completed'],
    default: 'pending'
  },
  waitlistPosition: {
    type: Number,
    default: 0
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
});

// Index for efficient queries
reservationSchema.index({ user: 1, book: 1, status: 1 });

// Method to check if a book is available for reservation
reservationSchema.statics.isBookAvailable = async function(bookId) {
  const book = await mongoose.model('Book').findById(bookId);
  if (!book) return false;
  return book.status === 'available';
};

// Method to get current waitlist position for a book
reservationSchema.statics.getWaitlistPosition = async function(bookId) {
  const pendingReservations = await this.countDocuments({
    book: bookId,
    status: 'pending'
  });
  return pendingReservations + 1;
};

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;