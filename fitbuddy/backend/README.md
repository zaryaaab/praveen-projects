# FitBuddy Backend

Backend server for the FitBuddy fitness tracking platform.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── index.js       # Entry point
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values as needed

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## API Documentation

The API endpoints will be documented here once implemented.

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot-reload
- `npm test`: Run the test suite

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Jest for testing