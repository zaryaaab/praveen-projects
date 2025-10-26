# Library Management System - Backend

A Node.js backend service for the Library Management System that handles book management, user authentication, and reservations.

## Features

- User authentication and authorization (JWT-based)
- Book management (CRUD operations)
- Book reservations
- Book recommendations based on user history
- Image upload for book covers
- Search functionality with filters

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Books-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your_jwt_secret_key
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. The server will start on http://localhost:3000

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- PUT `/api/auth/profile` - Update user profile

### Books

- GET `/api/books/search` - Search books with filters
- GET `/api/books/recommendations` - Get book recommendations
- GET `/api/books/popular` - Get popular books
- GET `/api/books/:id` - Get book by ID
- POST `/api/books` - Add new book (admin only)
- PUT `/api/books/:id` - Update book (admin only)
- DELETE `/api/books/:id` - Delete book (admin only)

### Reservations

- POST `/api/reservations` - Create a new reservation
- GET `/api/reservations` - Get user's reservations
- PUT `/api/reservations/:id` - Update reservation status
- DELETE `/api/reservations/:id` - Cancel reservation

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.