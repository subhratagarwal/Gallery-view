const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const Image = require('../models/Image');
const router = express.Router();

// Multer storage configuration to save files with original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with the original extension
    const ext = path.extname(file.originalname);
    const basename = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, basename + ext);
  }
});

const upload = multer({ storage: storage });

// JWT Auth Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const url = `/uploads/${req.file.filename}`;
    const image = await Image.create({
      filename: req.file.originalname,
      url,
      uploadedBy: req.user.username
    });
    res.status(201).json(image);
  } catch {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    if (image.uploadedBy !== req.user.username) {
      return res.status(403).json({ error: 'Not authorized to delete this image' });
    }
    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
