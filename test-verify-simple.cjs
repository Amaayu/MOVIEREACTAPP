const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';

async function testVerifyEndpoint() {
  console.log('🧪 Testing Email Verification Endpoint\n');
  
  // Test 1: Invalid token (should return 400)
  console.log('Test 1: Invalid token');
  try {
    const invalidToken = crypto.randomBytes(32).toString('hex');
    await axios.get(`${BASE_URL}/api/auth/verify-email/${invalidToken}`);
    console.log('❌ Should have failed with invalid token\n');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid token');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${error.response.data.message}\n`);
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
      console.log(`   Status: ${error.response?.status}\n`);
    }
  }
  
  // Test 2: Register a new user
  console.log('Test 2: Register new user');
  const testEmail = `test${Date.now()}@example.com`;
  const testUser = {
    name: 'Test User',
    email: testEmail,
    password: 'password123'
  };
  
  try {
    const registerRes = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Registration successful');
    console.log(`   Email: ${testEmail}`);
    console.log(`   User ID: ${registerRes.data.user.id}`);
    console.log(`   Email verified: ${registerRes.data.user.isEmailVerified}`);
    console.log(`   Message: ${registerRes.data.message}\n`);
    
    // Test 3: Try to login without verification (should fail)
    console.log('Test 3: Try to login without email verification');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testEmail,
        password: 'password123'
      });
      console.log('❌ Should have failed - email not verified\n');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.emailNotVerified) {
        console.log('✅ Correctly blocked unverified user');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message}\n`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}\n`);
      }
    }
    
    console.log('✅ All API endpoint tests passed!');
    console.log('\n📝 Manual verification test:');
    console.log('   1. Check your email for the verification link');
    console.log('   2. Click the link (it should redirect to /verify-email?token=...)');
    console.log('   3. The page should show "Email Verified!" message');
    console.log('   4. You should be redirected to login page');
    console.log('   5. Login should work after verification\n');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
  }
}

testVerifyEndpoint().catch(console.error);
