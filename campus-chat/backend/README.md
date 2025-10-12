# Campus Chat Backend

A real-time chat application backend built with Node.js, Express, and MongoDB.

## Features

- User authentication (register, login)
- Real-time messaging
- Group and direct conversations
- Message reactions and read status
- User blocking functionality
- Push notifications
- File sharing support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/block/:userId` - Block a user
- `DELETE /api/users/block/:userId` - Unblock a user

### Conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `POST /api/conversations/:id/participants` - Add participants to group
- `POST /api/conversations/:id/leave` - Leave conversation

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/:conversationId` - Get conversation messages
- `POST /api/messages/:messageId/reactions` - Add reaction to message
- `DELETE /api/messages/:messageId/reactions` - Remove reaction
- `POST /api/messages/:messageId/read` - Mark message as read
- `PUT /api/messages/:messageId` - Edit message

### Notifications
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:notificationId` - Delete notification

## Authentication

All endpoints except `/api/users/register` and `/api/users/login` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Models

### User
- email (unique)
- password_hash
- name
- created_at
- updated_at

### Conversation
- type (direct/group)
- name (for groups)
- created_by
- participants (array)
- created_at
- updated_at

### Message
- conversation_id
- sender_id
- content
- message_type (text/image/file)
- file_data
- reactions (array)
- read_by (array)
- created_at
- updated_at

### Notification
- user_id
- type
- title
- content
- related_id
- is_read
- created_at