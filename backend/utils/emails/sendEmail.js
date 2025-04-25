// backend/utils/emails/sendEmail.js

const { Resend } = require("resend");
const logger = require("../common/logger");

/**
 * Send an email using Resend API
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

    // Send email with Resend
    return await sendWithResend(
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
 * Send an email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWithResend = async (to, subject, htmlContent, textContent) => {
  // Check if Resend API key is set
  if (!process.env.RESEND_API_KEY) {
    logger.error(
      "Resend API key is not configured. Please set RESEND_API_KEY in .env file."
    );
    throw new Error("Resend API key is not configured");
  }

  // Initialize Resend client
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Define from email address
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  try {
    // Send email with Resend
    const data = await resend.emails.send({
      from: `E-Commerce Store <${fromEmail}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    logger.info(`Email sent to ${to} with Resend ID: ${data.id}`);
    return data;
  } catch (error) {
    logger.error("Resend error:", error);
    throw error;
  }
};

module.exports = sendEmail;
