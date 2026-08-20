import express from 'express';
import { generateIdea } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Ensure only authenticated users can use the AI

router.post('/generate-idea', generateIdea);

export default router;
