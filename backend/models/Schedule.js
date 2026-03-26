const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
  },
  time: { type: String, required: true },
  className: { type: String, required: true, trim: true },
  trainer: { type: String, required: true },
  duration: { type: Number, required: true, min: 1 },
  capacity: { type: Number, required: true, min: 1 },
  category: { 
    type: String, 
    enum: ['HIIT', 'Strength', 'Yoga', 'Bodybuilding', 'Cardio', 'Other'],
    default: 'Other'
  },
  room: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
