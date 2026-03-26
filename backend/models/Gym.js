const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  hours: {
    weekdays: String,
    weekends: String,
    holidays: String
  },
  amenities: [String],
  about: { type: String },
  socialLinks: {
    instagram: String,
    facebook: String,
    youtube: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
