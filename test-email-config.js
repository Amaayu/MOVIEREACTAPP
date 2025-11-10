// Quick test script to verify SMTP configuration
// Run with: node test-email-config.js

require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

async function testEmailConfig() {
  console.log('🔍 Testing SMTP Configuration...\n');
  
  // Check environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('\nPlease add these to your backend/.env file');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables found\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Secure: ${process.env.SMTP_SECURE || 'false'}\n`);
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  try {
    console.log('🔌 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Optional: Send test email
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        readline.question('Enter recipient email: ', async (email) => {
          try {
            console.log('\n📧 Sending test email...');
            const info = await transporter.sendMail({
              from: `"${process.env.SMTP_FROM_NAME || 'MovieHub'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
              to: email,
              subject: 'Test Email - MovieHub',
              html: '<h1>Success!</h1><p>Your SMTP configuration is working correctly.</p>',
              text: 'Success! Your SMTP configuration is working correctly.',
            });
            
            console.log('✅ Test email sent successfully!');
            console.log('Message ID:', info.messageId);
          } catch (error) {
            console.error('❌ Failed to send test email:', error.message);
          }
          readline.close();
          process.exit(0);
        });
      } else {
        readline.close();
        console.log('\n✅ Configuration test complete!');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify SMTP credentials are correct');
    console.log('2. For Gmail, use an App Password (not your regular password)');
    console.log('3. Check if port 587 is blocked by firewall');
    console.log('4. Verify SMTP_HOST is correct for your provider');
    process.exit(1);
  }
}

testEmailConfig();
