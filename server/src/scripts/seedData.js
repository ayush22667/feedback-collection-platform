require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Form = require('../models/Form');
const Response = require('../models/Response');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting data seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Form.deleteMany({});
    await Response.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Create sample admin user
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      businessName: 'Demo Business'
    });
    console.log('👤 Created admin user: admin@example.com');
    
    // Create sample forms
    const sampleForms = [
      {
        userId: adminUser._id,
        title: 'Customer Satisfaction Survey',
        description: 'Help us improve our services by sharing your feedback',
        questions: [
          {
            text: 'How satisfied are you with our service?',
            type: 'radio',
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
            required: true,
            order: 1
          },
          {
            text: 'What features do you use most?',
            type: 'checkbox',
            options: ['Dashboard', 'Reports', 'Analytics', 'Integrations', 'Mobile App'],
            required: false,
            order: 2
          },
          {
            text: 'How can we improve our service?',
            type: 'textarea',
            required: false,
            order: 3
          }
        ],
        isActive: true
      }
    ];
    
    const createdForms = await Form.insertMany(sampleForms);
    console.log(`📝 Created ${createdForms.length} sample forms`);
    
    // Create sample responses
    const sampleResponses = [
      {
        formId: createdForms[0]._id,
        answers: [
          { questionId: createdForms[0].questions[0]._id, answer: 'Very Satisfied' },
          { questionId: createdForms[0].questions[1]._id, answer: ['Dashboard', 'Analytics'] },
          { questionId: createdForms[0].questions[2]._id, answer: 'Keep up the great work!' }
        ]
      }
    ];
    
    await Response.insertMany(sampleResponses);
    console.log(`💬 Created ${sampleResponses.length} sample responses`);
    
    console.log('\n✅ Data seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`   Admin User: admin@example.com (Password: Password123!)`);
    console.log(`   Forms: ${createdForms.length}`);
    console.log(`   Responses: ${sampleResponses.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();