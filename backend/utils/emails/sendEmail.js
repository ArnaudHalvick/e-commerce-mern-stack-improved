// backend/utils/emails/sendEmail.js

const nodemailer = require("nodemailer");
const logger = require("../common/logger");

/**
 * Send an email using Resend SMTP
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message (optional)
 * @param {string} options.html - HTML content of the email (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
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

    // Send email with Resend SMTP
    return await sendWithSMTP(
      options.email,
      options.subject,
      htmlContent,
      textContent
    );
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send an email using Resend SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWithSMTP = async (to, subject, htmlContent, textContent) => {
  // Check if Resend API key is set
  if (!process.env.RESEND_API_KEY) {
    logger.error(
      "Resend API key is not configured. Please set RESEND_API_KEY in .env file."
    );
    throw new Error("Resend API key is not configured");
  }

  // Define from email address
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  // SMTP port (default to 465 for SSL)
  const smtpPort = process.env.RESEND_SMTP_PORT || 465;

  // Create a transporter for Resend SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: parseInt(smtpPort),
    secure: smtpPort === "465" || smtpPort === "2465", // true for 465, false for other ports
    auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // Define email options
  const mailOptions = {
    from: `E-Commerce Store <${fromEmail}>`,
    to: to,
    subject: subject,
  };

  // Add content to mail options
  if (textContent) mailOptions.text = textContent;
  if (htmlContent) mailOptions.html = htmlContent;

  try {
    // Verify connection configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to} with Resend SMTP: ${info.messageId}`);

    return {
      id: info.messageId,
      smtp: true,
    };
  } catch (error) {
    logger.error("Resend SMTP error:", error);
    throw error;
  }
};

module.exports = sendEmail;
