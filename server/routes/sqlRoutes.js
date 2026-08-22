import express from 'express';
import { getPostsWithAuthors } from '../controllers/sqlController.js';

const router = express.Router();

// Route: GET /api/sql/posts
router.get('/posts', getPostsWithAuthors);

export default router;
