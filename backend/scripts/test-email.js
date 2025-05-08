// backend/scripts/test-email.js

// Load environment variables
require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? "./.env.dev" : "./.env",
});

const sendEmail = require("../utils/emails/sendEmail");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Start the test
console.log("\n=== MailerSend Email Test ===\n");

// Display current configuration
console.log("Current email configuration:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(`- FROM_EMAIL: ${process.env.FROM_EMAIL || "not set"}`);
console.log(
  `- MAILERSEND_API_KEY: ${
    process.env.MAILERSEND_API_KEY ? "******" : "not set"
  }\n`
);

// Ask for recipient email
rl.question("Enter recipient email address: ", async (email) => {
  if (!email || !email.includes("@")) {
    console.error("Error: Invalid email address");
    rl.close();
    return;
  }

  // Ask for subject
  rl.question(
    "Enter email subject (or press Enter for default): ",
    async (subject) => {
      const emailSubject = subject || "Test Email from E-Commerce MERN App";

      console.log(`\nSending test email to: ${email}`);
      console.log(`Subject: ${emailSubject}`);
      console.log("Please wait...\n");

      try {
        const result = await sendEmail({
          email,
          subject: emailSubject,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 5px;">
            <h1 style="color: #f85606;">MailerSend Test Email</h1>
            <p style="color: #333; line-height: 1.5;">This is a test email sent from your e-commerce application at ${new Date().toLocaleString()}.</p>
            <p style="color: #333; line-height: 1.5;">If you're receiving this, it means your email service is correctly configured with MailerSend!</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
              <p style="color: #999; font-size: 12px;">This is an automated test message, please do not reply.</p>
            </div>
          </div>
        `,
        });

        console.log("✅ Email sent successfully!");
        console.log("Result:", result);
      } catch (error) {
        console.error("❌ Error sending email:");
        console.error(error.message);
        if (error.response) {
          console.error("Response:", error.response);
        }
      }

      rl.close();
    }
  );
});

rl.on("close", () => {
  console.log("\n=== Email Test Completed ===\n");
  process.exit(0);
});
