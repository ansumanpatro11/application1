# Video Platform Backend

A comprehensive Node.js backend API for a video streaming platform, built with Express.js and MongoDB. This application provides complete functionality for managing videos, users, comments, likes, playlists, subscriptions, and dashboards.

## Features

- **User Management**: User authentication, registration, and profile management with JWT tokens
- **Video Management**: Upload, retrieve, and manage video content
- **Comments System**: Add and manage comments on videos
- **Likes Feature**: Like/unlike videos and comments
- **Playlists**: Create and manage custom video playlists
- **Subscriptions**: Subscribe to channels and manage subscriptions
- **Dashboard**: Analytics and dashboard for content creators
- **Cloud Storage**: Cloudinary integration for video and image uploads
- **Authentication**: JWT-based authentication with secure password hashing using bcrypt

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) & bcrypt
- **File Upload**: Multer with Cloudinary integration
- **CORS**: Cross-origin resource sharing enabled
- **Cookie Handling**: Cookie-parser for session management

## Project Structure

```
src/
├── controllers/        # Business logic for each feature
├── routes/            # API endpoint definitions
├── models/            # MongoDB schemas
├── middlewares/       # Auth & file upload middleware
├── utils/             # Helper functions & error handling
├── db/                # Database connection
├── constants.js       # Application constants
├── app.js             # Express app configuration
└── index.js           # Server entry point
```

## API Endpoints

- `/api/v1/users` - User authentication and management
- `/api/v1/videos` - Video CRUD operations
- `/api/v1/comments` - Comment management
- `/api/v1/likes` - Like functionality
- `/api/v1/playlist` - Playlist operations
- `/api/v1/subscriptions` - Subscription management
- `/api/v1/dashboard` - Creator dashboard

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB database
- Cloudinary account for media storage

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start development server:

```bash
npm run dev
```

The server runs with nodemon for automatic reloading during development.

## Author

Ansuman
