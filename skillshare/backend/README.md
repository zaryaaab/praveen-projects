# SkillShare Backend API

A Node.js backend application for the SkillShare platform, built with Express.js and MongoDB.

## Features

- User authentication and authorization
- RESTful API endpoints
- MongoDB database integration
- JWT-based authentication
- CORS enabled
- Environment variables configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd skill-share-be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory and add your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skillshare
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h
   ```

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /`: Welcome message
- More endpoints will be added as development progresses

## Project Structure

```
├── server.js          # Application entry point
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies and scripts
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

ISC