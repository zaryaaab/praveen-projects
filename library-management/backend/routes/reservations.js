/**
 * Reservations API Router
 * Handles all reservation-related operations including:
 * - Creating new reservations
 * - Managing waitlist
 * - Viewing user reservations
 * - Admin operations for reservation management
 */

const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const { auth, isAdmin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

/**
 * Converts a book cover image to base64 format
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string|null>} Base64 encoded image string or null if conversion fails
 */
async function getImageBase64(imagePath) {
  try {
    if (!imagePath) return null;
    const fullPath = path.join(__dirname, '..', imagePath);
    const imageBuffer = await fs.promises.readFile(fullPath);
    const base64Image = imageBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error reading image:', error);
    return null;
  }
}

/**
 * Adds base64 encoded cover images to reservation's book objects
 * @param {Array|Object} reservations - Single reservation object or array of reservation objects
 * @returns {Promise<Array|Object>} Reservations with added base64 cover images for books
 */
async function addBase64Images(reservations) {
  if (!Array.isArray(reservations)) {
    reservations = [reservations];
  }

  const booksWithImages = await Promise.all(reservations.map(async (reservation) => {
    const bookObj = reservation.book.toObject();
    if (bookObj.coverImage) {
      bookObj.coverImageBase64 = await getImageBase64(bookObj.coverImage);
    }

    return {
      ...reservation.toObject(),
      book: bookObj,
    };
  }));


  return Array.isArray(reservations) ? booksWithImages : booksWithImages[0];
}

/**
 * Create a new reservation and add to waitlist
 * @route POST /api/reservations
 * @param {string} req.body.bookId - ID of the book to reserve
 * @requires Authentication
 * @returns {Object} New reservation object with waitlist position
 */
router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await Reservation.findOne({
      user: req.user._id,
      book: bookId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'You already have an active reservation for this book' });
    }

    const reservation = new Reservation({
      user: req.user._id,
      book: bookId,
      status: 'pending',
      waitlistPosition: await Reservation.getWaitlistPosition(bookId)
    });

    await reservation.save();

    res.status(201).json({
      message: 'Added to waitlist',
      reservation
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

/**
 * Get all reservations for the authenticated user
 * @route GET /api/reservations/my-reservations
 * @requires Authentication
 * @returns {Array} List of user's reservations with book details and cover images
 */
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('book')
      .sort({ requestDate: -1 });

    const reservationsWithImages = await addBase64Images(reservations);

    res.json(reservationsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

/**
 * Cancel an existing reservation and update waitlist positions
 * @route POST /api/reservations/:id/cancel
 * @param {string} id - Reservation ID to cancel
 * @requires Authentication
 * @returns {Object} Confirmation message
 */
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or cannot be cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // Update waitlist positions for other reservations
    if (reservation.waitlistPosition > 1) {
      await Reservation.updateMany(
        {
          book: reservation.book,
          waitlistPosition: { $gt: reservation.waitlistPosition }
        },
        { $inc: { waitlistPosition: -1 } }
      );
    }

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
});

/**
 * Get all reservations with optional filters (Admin only)
 * @route GET /api/reservations/all
 * @param {string} [status] - Filter by reservation status
 * @param {string} [userId] - Filter by user ID
 * @param {string} [bookId] - Filter by book ID
 * @requires Authentication and Admin privileges
 * @returns {Array} List of all reservations matching the filters
 */
router.get('/all', [auth, isAdmin], async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (bookId) filter.book = bookId;

    const reservations = await Reservation.find(filter)
      .populate('user', 'firstName lastName')
      .populate('book', 'title status')
      .sort({ requestDate: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all reservations', error: error.message });
  }
});

/**
 * Update reservation status and manage book availability (Admin only)
 * @route PUT /api/reservations/:id/status
 * @param {string} id - Reservation ID to update
 * @param {string} status - New reservation status
 * @requires Authentication and Admin privileges
 * @returns {Object} Updated reservation object
 */
router.put('/:id/status', [auth, isAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const oldStatus = reservation.status;
    reservation.status = status;

    if (status === 'approved') {
      reservation.approvalDate = new Date();
      reservation.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

      // Update book availability
      await Book.findByIdAndUpdate(reservation.book, {
        status: 'borrowed'
      });
    } else if (status === 'completed' && oldStatus === 'approved') {
      reservation.returnDate = new Date();

      // Process waitlist
      const nextInLine = await Reservation.findOne({
        book: reservation.book,
        status: 'pending',
        waitlistPosition: { $gt: 1 }
      }).sort({ waitlistPosition: 1 });

      if (nextInLine) {
        nextInLine.waitlistPosition = 1;
        nextInLine.status = 'approved';
        await nextInLine.save();
      } else {
  // Update book availability
  await Book.findByIdAndUpdate(reservation.book, {
    status: 'available'
  });
      }
    }

    await reservation.save();

    res.json(
      reservation
    );
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation status', error: error.message });
  }
});

module.exports = router;