// backend/utils/sendEmail.js

const nodemailer = require("nodemailer");
const logger = require("./common/logger");

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message
 * @param {string} options.html - HTML content of the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // Check if SMTP credentials are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      logger.error(
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
        process.env.SMTP_FROM_EMAIL || "noreply@ecommerce.com"
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
