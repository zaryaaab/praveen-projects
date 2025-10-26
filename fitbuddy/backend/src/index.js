require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import auth routes
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Use auth routes
app.use('/api/auth', authRoutes);

// Use activity routes
app.use('/api/activities', require('./routes/activity'));

// Use diet plan routes
app.use('/api/dietplans', require('./routes/dietPlan'));

// Use custom diet routes
app.use('/api/customdiets', require('./routes/customDiet'));

// Use workouts routes
app.use('/api/workouts', require('./routes/workout'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to FitBuddy API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});