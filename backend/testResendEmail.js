require("dotenv").config();

const sendEmail = require("./utils/emails/sendEmail");
const logger = require("./utils/common/logger");

/**
 * Test script for sending an email with Resend
 * Run with: node testResendEmail.js
 */
async function testResendEmail() {
  try {
    // Prepare test email
    const testEmailOptions = {
      email: "delivered@resend.dev", // Resend's testing email address
      subject: "Resend Test Email",
      html: `
        <h1>Testing Resend Email Service</h1>
        <p>This is a test email sent using Resend API integration.</p>
        <p>Configuration:</p>
        <ul>
          <li>From Email: ${process.env.FROM_EMAIL || "onboarding@resend.dev"}</li>
          <li>Date/Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p>If you're seeing this email, the Resend integration is working correctly!</p>
      `,
    };

    // Send the test email
    const result = await sendEmail(testEmailOptions);
    logger.info("Test email sent successfully with Resend!");
    logger.info("Result:", result);

    console.log(
      "\x1b[32m%s\x1b[0m",
      "✅ Test email sent successfully with Resend!"
    );
    console.log("Recipient:", testEmailOptions.email);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    logger.error("Failed to send test email:", error);
    console.error("\x1b[31m%s\x1b[0m", "❌ Failed to send test email:");
    console.error(error);
  }
}

// Run the test
testResendEmail();
