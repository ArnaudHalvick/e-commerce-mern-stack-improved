// backend/utils/emails/sendEmail.js

const nodemailer = require("nodemailer");
const logger = require("../common/logger");

/**
 * Send an email using Gmail SMTP
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message (optional)
 * @param {string} options.html - HTML content of the email (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // Check if Gmail credentials are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      logger.error(
        "Gmail credentials are not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file."
      );
      throw new Error("Gmail credentials are not configured");
    }

    // Create a transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // App Password, not regular Gmail password
      },
      debug: process.env.NODE_ENV !== "production", // Only enable debug in non-production environments
    });

    // Verify connection configuration
    await transporter.verify();

    // Determine content of email - prioritize HTML if provided
    let htmlContent = options.html || null;
    let textContent = options.message || null;

    // If only HTML is provided, generate text version
    if (htmlContent && !textContent) {
      // Simple HTML to text conversion (removing HTML tags)
      textContent = htmlContent
        .replace(/<[^>]*>?/gm, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    // If only text is provided but no HTML, create basic HTML
    else if (textContent && !htmlContent) {
      // Convert plain text to basic HTML with clickable links
      htmlContent = textContent
        .replace(/\n/g, "<br>")
        .replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" style="color: #f85606; text-decoration: underline;">$1</a>'
        );
    }

    // Define email options
    const mailOptions = {
      from: `"E-Commerce Store" <${
        process.env.GMAIL_USER || "noreply@ecommerce.com"
      }>`,
      to: options.email,
      subject: options.subject,
    };

    // Add content to mail options
    if (textContent) mailOptions.text = textContent;
    if (htmlContent) mailOptions.html = htmlContent;

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}: ${info.messageId}`);

    return info;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
