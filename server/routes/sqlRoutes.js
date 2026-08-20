import express from 'express';
import { getCreatorsWithProfiles } from '../controllers/sqlController.js';

const router = express.Router();

router.get('/creators', getCreatorsWithProfiles);

export default router;
