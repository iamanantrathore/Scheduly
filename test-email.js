require('dotenv').config();
const { sendMeetingEmail } = require('./src/services/emailService');

async function testEmail() {
  try {
    const result = await sendMeetingEmail({
      to: 'schedulyservices@gmail.com', // Use the configured email
      subject: 'Test Email',
      text: 'This is a test email to check if SMTP is working.'
    });
    console.log('Email sent:', result);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testEmail();