const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // Log email settings
    console.log("Email configuration:");
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER ? "****" : "Not set"}`);
    console.log(
      `SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? "****" : "Not set"}`
    );

    // Check if SMTP credentials are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error(
        "SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASSWORD in .env file."
      );
      throw new Error("SMTP credentials are not configured");
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      debug: true, // Enable debug logs
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Define email options
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || "noreply@ecommerce.com",
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, "<br>"),
    };

    console.log(`Sending email to: ${options.email}`);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
