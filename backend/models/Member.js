const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  plan: { type: String, required: true },
  planPrice: { type: Number, required: true },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
