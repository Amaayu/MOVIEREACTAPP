const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';

async function testVerifyEndpoint() {
  console.log('🧪 Testing Email Verification Endpoint\n');
  
  // Test 1: Invalid token
  console.log('Test 1: Invalid token');
  try {
    const invalidToken = crypto.randomBytes(32).toString('hex');
    await axios.get(`${BASE_URL}/api/auth/verify-email/${invalidToken}`);
    console.log('❌ Should have failed with invalid token\n');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid token');
      console.log(`   Response: ${error.response.data.message}\n`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}\n`);
    }
  }
  
  // Test 2: Register a new user and verify
  console.log('Test 2: Register and verify new user');
  const testEmail = `test${Date.now()}@example.com`;
  const testUser = {
    name: 'Test User',
    email: testEmail,
    password: 'password123'
  };
  
  try {
    // Register
    console.log(`   Registering user: ${testEmail}`);
    const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log(`   ✅ Registration successful`);
    console.log(`   User ID: ${registerRes.data.user.id}`);
    console.log(`   Email verified: ${registerRes.data.user.isEmailVerified}`);
    
    // Get the verification token from database (in real scenario, from email)
    const mongoose = require('./backend/node_modules/mongoose');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moviehub');
    const User = require('./backend/models/User.js');
    
    const user = await User.findOne({ email: testEmail });
    if (!user || !user.emailVerificationToken) {
      console.log('   ❌ No verification token found');
      return;
    }
    
    const token = user.emailVerificationToken;
    console.log(`   Verification token: ${token.substring(0, 20)}...`);
    
    // Verify email
    console.log('   Verifying email...');
    const verifyRes = await axios.get(`${BASE_URL}/api/auth/verify-email/${token}`);
    console.log(`   ✅ Email verified successfully`);
    console.log(`   Response: ${verifyRes.data.message}`);
    
    // Check user is now verified
    const verifiedUser = await User.findOne({ email: testEmail });
    console.log(`   Email verified in DB: ${verifiedUser.isEmailVerified}`);
    console.log(`   Token cleared: ${!verifiedUser.emailVerificationToken}\n`);
    
    // Test 3: Try to login
    console.log('Test 3: Login with verified account');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log('   ✅ Login successful');
    console.log(`   Token received: ${loginRes.data.token.substring(0, 20)}...\n`);
    
    // Cleanup
    await User.deleteOne({ email: testEmail });
    await mongoose.disconnect();
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testVerifyEndpoint().catch(console.error);
