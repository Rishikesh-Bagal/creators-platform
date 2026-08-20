import express from 'express';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to upload a buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - The file buffer from Multer
 * @returns {Promise} - Resolves with Cloudinary upload result
 */
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'creator-platform',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @route   POST /api/upload
// @desc    Upload a file to Cloudinary
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

// @route   DELETE /api/upload
// @desc    Delete a file from Cloudinary
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Extract publicId from Cloudinary URL
    // Format: https://res.cloudinary.com/.../.../creator-platform/filename.jpg
    const parts = url.split('/');
    const fileWithExtension = parts.pop();
    const folder = parts.pop();
    const filename = fileWithExtension.split('.')[0];
    const publicId = `${folder}/${filename}`;

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ success: true, message: 'Image deleted' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image',
    });
  }
});

// Multer error handling middleware (must have 4 parameters)
router.use((error, req, res, next) => {
  if (error instanceof express.Error || error.message.includes('MulterError') || error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
});

export default router;
