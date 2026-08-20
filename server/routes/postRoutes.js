import express from 'express';
import { getPosts, getPostById, updatePost, deletePost, getPublicPosts } from '../controllers/postController.js';
import { createPostWithSocket } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

// Factory function — receives io so routes can emit socket events
const postRoutesFactory = (io) => {
  const router = express.Router();

  // Public routes
  router.get('/public', getPublicPosts);
  router.get('/:id', getPostById); // Accessible to everyone

  // All subsequent routes are protected
  router.use(protect);

  router.post('/', createPostWithSocket(io));
  router.get('/', getPosts);
  router.put('/:id', updatePost);
  router.delete('/:id', deletePost);

  return router;
};

export default postRoutesFactory;
