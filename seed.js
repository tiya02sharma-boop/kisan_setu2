const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const Land = require('./models/Land');
const Contract = require('./models/Contract');
const WorkLog = require('./models/WorkLog');
const Payment = require('./models/Payment');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    await User.deleteMany({});
    await Land.deleteMany({});
    await Contract.deleteMany({});
    await WorkLog.deleteMany({});
    await Payment.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { name: 'Ramesh Patel', phone: '9999999991', role: 'landowner', passwordHash, location: 'Gujarat', trustScore: 90 },
      { name: 'Suresh Kumar', phone: '9999999992', role: 'landowner', passwordHash, location: 'Punjab', trustScore: 85 },
      { name: 'Anil Sharma', phone: '9999999993', role: 'landowner', passwordHash, location: 'Haryana', trustScore: 92 },
      { name: 'Govind Ram', phone: '8888888881', role: 'farmer', passwordHash, location: 'Gujarat', trustScore: 95, skills: ['Wheat', 'Cotton'], experience: '10 years' },
      { name: 'Ram Singh', phone: '8888888882', role: 'farmer', passwordHash, location: 'Punjab', trustScore: 88, skills: ['Rice', 'Sugarcane'], experience: '8 years' },
      { name: 'Hari Om', phone: '8888888883', role: 'farmer', passwordHash, location: 'Haryana', trustScore: 80, skills: ['Vegetables'], experience: '5 years' },
      { name: 'Laxman', phone: '8888888884', role: 'farmer', passwordHash, location: 'MP', trustScore: 91, skills: ['Soybean'], experience: '12 years' },
      { name: 'Mohan', phone: '8888888885', role: 'farmer', passwordHash, location: 'UP', trustScore: 89, skills: ['Wheat'], experience: '7 years' }
    ]);

    const lands = await Land.insertMany([
      { ownerRef: users[0]._id, name: 'Saraswati Farm', location: { lat: 23.0225, lng: 72.5714, address: 'Village 1, Gujarat' }, size: 15, cropType: 'Cotton' },
      { ownerRef: users[1]._id, name: 'Green Acres', location: { lat: 30.9010, lng: 75.8573, address: 'Village 2, Punjab' }, size: 20, cropType: 'Wheat' },
    ]);

    console.log('Database Seeded!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
