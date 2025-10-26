/**
 * Books API Router
 * Handles all book-related operations including:
 * - Book search and filtering
 * - Book recommendations
 * - Popular books listing
 * - CRUD operations for books (with admin authorization)
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
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
 * Adds base64 encoded cover images to book objects
 * @param {Array|Object} books - Single book object or array of book objects
 * @returns {Promise<Array|Object>} Books with added base64 cover images
 */
async function addBase64Images(books) {
  if (!Array.isArray(books)) {
    books = [books];
  }
  
  const booksWithImages = await Promise.all(books.map(async (book) => {
    const bookObj = book.toObject();
    if (bookObj.coverImage) {
      bookObj.coverImageBase64 = await getImageBase64(bookObj.coverImage);
    }
    return bookObj;
  }));
  
  return Array.isArray(books) ? booksWithImages : booksWithImages[0];
}

/**
 * Search books with multiple filter options
 * @route GET /api/books/search
 * @param {string} query - Text search for title, author, or ISBN
 * @param {string} category - Filter by book category
 * @param {number} minRating - Filter by minimum rating
 * @param {boolean} availability - Filter by book availability
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query, category, minRating, availability } = req.query;
    const filter = {};

    // Text search for title, author, or ISBN
    if (query) {
      filter.$text = { $search: query };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Availability filter
    if (availability === 'true') {
      filter.status = 'available';
    }

    const books = await Book.find(filter)
      .select('-__v')
      .sort({ rating: -1 });

    const booksWithImages = await addBase64Images(books);
    res.json(booksWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
});

/**
 * Get personalized book recommendations based on user's reading history
 * @route GET /api/books/recommendations
 * Returns up to 10 recommended books from similar categories
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    // Get user's past reservations
    const userReservations = await Reservation.find({ user: req.user._id })
      .populate('book')
      .select('book');

    // Extract categories from user's past reads
    const userCategories = [...new Set(
      userReservations.map(reservation => reservation.book.category)
    )];

    // Find books in similar categories
    const recommendations = await Book.find({
      category: { $in: userCategories },
      _id: { $nin: userReservations.map(r => r.book._id) },
    })
      .sort({ rating: -1 })
      .limit(10);

    const recommendationsWithImages = await addBase64Images(recommendations);
    res.json(recommendationsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations', error: error.message });
  }
});

/**
 * Get list of popular books sorted by rating
 * @route GET /api/books/popular
 * Returns top 10 highest rated books
 */
router.get('/popular', auth, async (req, res) => {
  try {
    const popularBooks = await Book.find()
      .sort({ rating: -1})
      .limit(10);

    const popularBooksWithImages = await addBase64Images(popularBooks);
    res.json(popularBooksWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Error getting popular books', error: error.message });
  }
});

/**
 * Retrieve a specific book by its ID
 * @route GET /api/books/:id
 * @param {string} id - Book's unique identifier
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('-__v');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error getting book', error: error.message });
  }
});

/**
 * Create a new book (Admin only)
 * @route POST /api/books
 * @param {Object} req.body - Book details
 * @param {File} req.file - Book cover image file
 * Requires admin authorization
 */
router.post('/', [auth, isAdmin], upload.single('coverImage'), async (req, res) => {
  try {
    const book = new Book({
      ...req.body,
      addedBy: req.user._id,
      coverImage: req.file ? `/uploads/books/${req.file.filename}` : null
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error adding book', error: error.message });
  }
});

/**
 * Update an existing book (Admin only)
 * @route PUT /api/books/:id
 * @param {string} id - Book's unique identifier
 * @param {Object} req.body - Updated book details
 * Requires admin authorization
 */
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

/**
 * Delete a book (Admin only)
 * @route DELETE /api/books/:id
 * @param {string} id - Book's unique identifier
 * Requires admin authorization
 */
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

module.exports = router;