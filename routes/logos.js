const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Logo = require('../models/Logo');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|svg/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5000000 } // 5MB limit
});

// Get all logos
router.get('/', async (req, res) => {
  try {
    const logos = await Logo.find().sort({ uploadDate: -1 });
    res.render('logos', { logos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search logos
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    let logos;
    
    if (searchTerm) {
      logos = await Logo.find({ $text: { $search: searchTerm } });
    } else {
      logos = await Logo.find().sort({ uploadDate: -1 });
    }
    
    res.render('logos', { logos, searchTerm });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get upload form
router.get('/upload', (req, res) => {
  res.render('upload');
});

// Upload a new logo
router.post('/', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }
  
  const { title, description, tags, uploadedBy } = req.body;
  
  try {
    const newLogo = new Logo({
      title,
      description,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: uploadedBy || 'Anonymous'
    });
    
    await newLogo.save();
    res.redirect('/logos');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a single logo
router.get('/:id', async (req, res) => {
  try {
    const logo = await Logo.findById(req.params.id);
    if (!logo) return res.status(404).json({ message: 'Logo not found' });
    
    res.render('logo-detail', { logo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
