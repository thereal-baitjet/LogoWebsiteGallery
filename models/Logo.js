const mongoose = require('mongoose');

const LogoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: String,
    default: 'Anonymous'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
LogoSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Logo', LogoSchema);
