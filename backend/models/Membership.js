const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  duration: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  color: { type: String, default: '#F59E0B' },
  features: [String],
  highlighted: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);
