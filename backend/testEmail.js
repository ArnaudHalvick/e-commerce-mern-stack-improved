// backend/testEmail.js

require("dotenv").config();
const sendEmail = require("./utils/emails/sendEmail");

/**
 * Email Test Script
 *
 * This script tests the Gmail email configuration by sending a test email.
 * Usage: node testEmail.js [recipient@example.com]
 */

// Get recipient email from command line arguments or use default
const recipientEmail = process.argv[2] || "test@example.com";

console.log("Email Configuration Test");
console.log("----------------------");
console.log(`Gmail User: ${process.env.GMAIL_USER}`);
console.log(`Sending test to: ${recipientEmail}`);
console.log("----------------------");

async function runTest() {
  try {
    await sendEmail({
      email: recipientEmail,
      subject: "Test Email from E-Commerce App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h1 style="color: #f85606; text-align: center;">Email Configuration Test</h1>
          <p>This is a test email to verify that your Gmail SMTP configuration is working correctly.</p>
          <p style="background-color: #e8f5e9; padding: 10px; border-radius: 4px;">If you're seeing this email, it means your email service is properly configured! 🎉</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from: ${process.env.GMAIL_USER}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log("✅ Success! Test email sent successfully.");
  } catch (error) {
    console.error("❌ Error sending test email:");
    console.error(error.message);
    process.exit(1);
  }
}

runTest();
