# Low-Level Design (LLD)

## 1. Introduction
This document details the low-level design of the Creators Platform, including database schema, API endpoints, and component structure.

## 2. Database Schema (Mongoose Models)

### 2.1 User Model (`User.js`)
- `username`: String, Required, Unique
- `email`: String, Required, Unique
- `password`: String, Required (Hashed using bcrypt)
- `createdAt` / `updatedAt`: Timestamps

### 2.2 Post Model (`Post.js`)
- `title`: String, Required
- `content`: String, Required
- `author`: ObjectId (References User), Required
- `imageUrl`: String (Cloudinary URL), Optional
- `createdAt` / `updatedAt`: Timestamps

## 3. API Endpoints

### 3.1 Authentication & Users
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate a user and return a JWT.
- `GET /api/users/me`: Get current authenticated user details.

### 3.2 Posts
- `GET /api/posts`: Retrieve a paginated list of posts.
- `GET /api/posts/:id`: Retrieve a specific post by ID.
- `POST /api/posts`: Create a new post (Requires Auth).
- `PUT /api/posts/:id`: Update an existing post (Requires Auth, must be owner).
- `DELETE /api/posts/:id`: Delete a post (Requires Auth, must be owner).

### 3.3 Media Uploads
- `POST /api/upload`: Upload an image file to Cloudinary and return the URL (Requires Auth).

## 4. Frontend Component Structure

### 4.1 Routing (`App.jsx`)
- **Public Routes**: `/` (Home), `/login`, `/register`.
- **Protected Routes**: `/dashboard`, `/create-post`, `/edit/:id`.
- **Catch-all**: `*` (NotFound).

### 4.2 Contexts
- `AuthContext`: Manages user authentication state, login/logout functions, and token storage.

### 4.3 Key Pages & Components
- **Header/Footer**: Persistent layout components.
- **Home**: Landing page displaying recent public posts.
- **Dashboard**: Personalized view for authenticated users to manage their posts.
- **CreatePost / EditPost**: Forms with validation and media upload integration for content management.
- **ProtectedRoute / PublicRoute**: Wrapper components to enforce route access control based on AuthContext.

## 5. Middleware (Backend)
- `errorMiddleware`: Catches errors across all routes and formats the response consistently (status code, message, and stack trace in development).
- `authMiddleware`: Verifies the JWT from the `Authorization` header and populates `req.user`.

## 6. Real-time Communication (Socket.io)
- Integrated into `server/app.js` and passed to `postRoutes`.
- Uses custom JWT authentication middleware for socket connections to map sockets to authenticated users.
