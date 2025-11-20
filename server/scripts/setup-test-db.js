// setup-test-db.js - Script to set up test database
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-testing-test';

async function setupTestDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Test database connected successfully');
    
    // You can add seed data here if needed
    // const User = require('../src/models/User');
    // await User.create({ ... });
    
    console.log('Test database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDB();

