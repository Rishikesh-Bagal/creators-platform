# High-Level Design (HLD)

## 1. Introduction
This document outlines the high-level architecture of the Creators Platform. The application follows a classic client-server architecture using the MERN stack (MongoDB, Express.js, React, Node.js) with additional real-time capabilities via Socket.io and media management via Cloudinary.

## 2. System Architecture

### 2.1 Client (Frontend)
- **Framework**: React.js built with Vite.
- **Routing**: React Router DOM for single-page application navigation.
- **State Management**: React Context API for global state (e.g., AuthContext).
- **Network Requests**: Axios for REST API communication, Socket.io-client for WebSocket connections.
- **UI Components**: Custom CSS with Toast notifications for user feedback.

### 2.2 Server (Backend)
- **Framework**: Node.js with Express.js.
- **API Architecture**: RESTful API design serving JSON data.
- **Real-time Communication**: Socket.io integrated with the HTTP server.
- **Authentication**: JWT validation via custom middleware.
- **File Uploads**: Multer combined with Cloudinary for handling multipart/form-data and cloud storage.

### 2.3 Database
- **DBMS**: MongoDB (managed via Mongoose ODM).
- **Collections**: Users and Posts.

## 3. Data Flow
1. **Client Request**: The React application sends HTTP requests (GET, POST, PUT, DELETE) via Axios to the Express server.
2. **Authentication**: Requests to protected routes include a JWT in the authorization header. The server verifies the token before processing the request.
3. **Business Logic**: Express route handlers and controllers process the incoming data.
4. **Database Interaction**: Mongoose interacts with MongoDB to read or write data.
5. **Media Storage**: If the request includes an image upload, the backend processes it using Multer and uploads it directly to Cloudinary, saving the resulting URL in MongoDB.
6. **Response**: The server sends a JSON response back to the client.
7. **Real-time Events**: Socket.io emits events to connected clients for real-time updates.

## 4. Deployment Architecture
- **Environment**: The application is containerized using Docker (as indicated by Dockerfile and docker-compose configurations).
- **Frontend & Backend**: Both can be served concurrently in development or built for production deployment.
