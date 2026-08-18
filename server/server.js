import dotenv from 'dotenv';

// Load environment variables FIRST - before any other imports
// This ensures process.env is populated when app.js and db.js are loaded
dotenv.config();

import { httpServer } from './app.js';
import connectDB from './config/db.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server (using httpServer, not app.listen)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready on port ${PORT}`);
});