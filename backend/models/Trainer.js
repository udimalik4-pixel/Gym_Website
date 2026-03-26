const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  experience: { type: Number, required: true, min: 0 },
  specialties: [String],
  certifications: [String],
  bio: { type: String },
  availability: { type: String },
  instagram: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Trainer', trainerSchema);
