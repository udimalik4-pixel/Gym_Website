require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/gym', require('./routes/gym'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/schedules', require('./routes/schedules'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IronPeak Gym API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ironpeak_gym';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await seedDatabase();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Seed initial data
async function seedDatabase() {
  const Gym = require('./models/Gym');
  const Membership = require('./models/Membership');
  const Trainer = require('./models/Trainer');
  const Schedule = require('./models/Schedule');

  const gymCount = await Gym.countDocuments();
  if (gymCount === 0) {
    await Gym.create({
      name: 'IronPeak Fitness',
      tagline: 'Forge Your Legacy',
      address: '42 Strength Avenue, Bengaluru, Karnataka 560001',
      phone: '+91 98765 43210',
      email: 'info@ironpeakfitness.com',
      hours: {
        weekdays: '5:00 AM – 11:00 PM',
        weekends: '6:00 AM – 10:00 PM',
        holidays: '7:00 AM – 8:00 PM'
      },
      amenities: ['Olympic Lifting Platform', 'Cardio Zone', 'Sauna & Steam', 'Nutrition Bar', 'Locker Rooms', 'Group Classes', 'Personal Training', 'Parking'],
      about: 'IronPeak Fitness is Bengaluru\'s premier strength and conditioning facility. Founded in 2018, we combine cutting-edge equipment with world-class coaching to help every member unlock their peak potential — whether you\'re a first-timer or an elite athlete.'
    });

    await Membership.insertMany([
      {
        name: 'Starter',
        price: 1499,
        duration: 'monthly',
        color: '#6B7280',
        features: ['Gym Floor Access', 'Locker Room', '2 Group Classes/Month', 'Fitness Assessment'],
        highlighted: false
      },
      {
        name: 'Warrior',
        price: 2999,
        duration: 'monthly',
        color: '#F59E0B',
        features: ['Unlimited Gym Access', 'Unlimited Group Classes', 'Sauna & Steam', '1 PT Session/Month', 'Nutrition Consultation', 'Guest Pass (2/month)'],
        highlighted: true
      },
      {
        name: 'Elite',
        price: 5499,
        duration: 'monthly',
        color: '#EF4444',
        features: ['Everything in Warrior', '4 PT Sessions/Month', 'Priority Booking', 'Personalized Program', 'Body Composition Analysis', 'Unlimited Guest Passes', 'Exclusive Elite Events'],
        highlighted: false
      }
    ]);

    await Trainer.insertMany([
      {
        name: 'Arjun Mehta',
        title: 'Head Coach & Strength Specialist',
        experience: 10,
        specialties: ['Powerlifting', 'Olympic Lifting', 'Strength & Conditioning'],
        certifications: ['NSCA-CSCS', 'USA Weightlifting L2', 'CPR/AED'],
        bio: 'Former national-level powerlifter with a decade of coaching experience. Arjun has trained over 300 athletes and holds multiple state records.',
        availability: 'Mon–Sat',
        instagram: '@arjun.lifts'
      },
      {
        name: 'Priya Sharma',
        title: 'HIIT & Functional Fitness Coach',
        experience: 7,
        specialties: ['HIIT', 'Functional Training', 'Weight Loss', 'Mobility'],
        certifications: ['ACE-CPT', 'Precision Nutrition L1', 'TRX Certified'],
        bio: 'Priya\'s high-energy classes have transformed hundreds of members. Her science-backed approach makes fitness accessible and effective for all levels.',
        availability: 'Mon–Fri',
        instagram: '@priya.fit'
      },
      {
        name: 'Rahul Nair',
        title: 'Bodybuilding & Physique Coach',
        experience: 8,
        specialties: ['Bodybuilding', 'Hypertrophy', 'Contest Prep', 'Nutrition'],
        certifications: ['ISSA-CPT', 'NASM-PES', 'Poliquin BioSignature'],
        bio: 'A competitive bodybuilder with 3 national titles, Rahul brings contest-level expertise to everyday athletes looking to sculpt their physique.',
        availability: 'Tue–Sun',
        instagram: '@rahul.physique'
      },
      {
        name: 'Kavya Reddy',
        title: 'Yoga & Recovery Specialist',
        experience: 6,
        specialties: ['Yoga', 'Pilates', 'Injury Rehab', 'Flexibility'],
        certifications: ['RYT-500', 'NASM-CES', 'Functional Range Conditioning'],
        bio: 'Kavya bridges the gap between performance and recovery. Her holistic methods help athletes move better, prevent injuries, and find balance.',
        availability: 'Mon–Sat',
        instagram: '@kavya.moves'
      }
    ]);

    await Schedule.insertMany([
      { day: 'Monday', time: '6:00 AM', className: 'Morning HIIT Blast', trainer: 'Priya Sharma', duration: 45, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Monday', time: '8:00 AM', className: 'Strength Fundamentals', trainer: 'Arjun Mehta', duration: 60, capacity: 12, category: 'Strength', room: 'Weight Floor' },
      { day: 'Monday', time: '12:00 PM', className: 'Power Yoga Flow', trainer: 'Kavya Reddy', duration: 60, capacity: 15, category: 'Yoga', room: 'Studio B' },
      { day: 'Monday', time: '6:30 PM', className: 'Olympic Lifting', trainer: 'Arjun Mehta', duration: 75, capacity: 8, category: 'Strength', room: 'Weight Floor' },
      { day: 'Monday', time: '7:30 PM', className: 'Pilates Core', trainer: 'Kavya Reddy', duration: 45, capacity: 15, category: 'Yoga', room: 'Studio B' },
      { day: 'Tuesday', time: '6:00 AM', className: 'Functional Fitness', trainer: 'Priya Sharma', duration: 50, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Tuesday', time: '9:00 AM', className: 'Bodybuilding Basics', trainer: 'Rahul Nair', duration: 60, capacity: 10, category: 'Bodybuilding', room: 'Weight Floor' },
      { day: 'Tuesday', time: '5:30 PM', className: 'Evening HIIT', trainer: 'Priya Sharma', duration: 45, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Tuesday', time: '7:00 PM', className: 'Hypertrophy Program', trainer: 'Rahul Nair', duration: 75, capacity: 10, category: 'Bodybuilding', room: 'Weight Floor' },
      { day: 'Wednesday', time: '6:00 AM', className: 'Morning Yoga', trainer: 'Kavya Reddy', duration: 60, capacity: 18, category: 'Yoga', room: 'Studio B' },
      { day: 'Wednesday', time: '8:00 AM', className: 'Strength & Power', trainer: 'Arjun Mehta', duration: 60, capacity: 12, category: 'Strength', room: 'Weight Floor' },
      { day: 'Wednesday', time: '6:30 PM', className: 'CrossFit Style WOD', trainer: 'Priya Sharma', duration: 60, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Thursday', time: '6:00 AM', className: 'Morning HIIT Blast', trainer: 'Priya Sharma', duration: 45, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Thursday', time: '10:00 AM', className: 'Physique Workshop', trainer: 'Rahul Nair', duration: 90, capacity: 8, category: 'Bodybuilding', room: 'Weight Floor' },
      { day: 'Thursday', time: '6:00 PM', className: 'Mobility & Flexibility', trainer: 'Kavya Reddy', duration: 60, capacity: 15, category: 'Yoga', room: 'Studio B' },
      { day: 'Thursday', time: '7:30 PM', className: 'Powerlifting Club', trainer: 'Arjun Mehta', duration: 90, capacity: 10, category: 'Strength', room: 'Weight Floor' },
      { day: 'Friday', time: '6:00 AM', className: 'Functional Fitness', trainer: 'Priya Sharma', duration: 50, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Friday', time: '9:00 AM', className: 'Yoga Restore', trainer: 'Kavya Reddy', duration: 75, capacity: 15, category: 'Yoga', room: 'Studio B' },
      { day: 'Friday', time: '5:30 PM', className: 'TGIF Burn', trainer: 'Priya Sharma', duration: 45, capacity: 20, category: 'HIIT', room: 'Studio A' },
      { day: 'Friday', time: '7:00 PM', className: 'Weekend Prep Lift', trainer: 'Rahul Nair', duration: 60, capacity: 12, category: 'Bodybuilding', room: 'Weight Floor' },
      { day: 'Saturday', time: '7:00 AM', className: 'Bootcamp Saturday', trainer: 'Priya Sharma', duration: 60, capacity: 25, category: 'HIIT', room: 'Studio A' },
      { day: 'Saturday', time: '9:00 AM', className: 'Olympic Lifting', trainer: 'Arjun Mehta', duration: 90, capacity: 8, category: 'Strength', room: 'Weight Floor' },
      { day: 'Saturday', time: '11:00 AM', className: 'Physique & Aesthetics', trainer: 'Rahul Nair', duration: 60, capacity: 10, category: 'Bodybuilding', room: 'Weight Floor' },
      { day: 'Saturday', time: '4:00 PM', className: 'Yin Yoga', trainer: 'Kavya Reddy', duration: 75, capacity: 18, category: 'Yoga', room: 'Studio B' },
      { day: 'Sunday', time: '8:00 AM', className: 'Sunday Power Hour', trainer: 'Arjun Mehta', duration: 60, capacity: 15, category: 'Strength', room: 'Weight Floor' },
      { day: 'Sunday', time: '10:00 AM', className: 'Recovery Flow', trainer: 'Kavya Reddy', duration: 60, capacity: 18, category: 'Yoga', room: 'Studio B' },
    ]);

    console.log('🌱 Database seeded successfully');
  }
}

module.exports = app;
