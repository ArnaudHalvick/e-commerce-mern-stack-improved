// backend/utils/emails/sendEmail.js

const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const logger = require("../common/logger");

/**
 * Send an email using MailerSend API
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email plain text message (optional)
 * @param {string} options.html - HTML content of the email (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    // Log email attempt for debugging
    logger.info(`Attempting to send email to: ${options.email}`, {
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!options.message,
    });

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

    // Set a timeout for email sending to prevent hanging indefinitely
    const emailPromise = sendWithMailerSend(
      options.email,
      options.subject,
      htmlContent,
      textContent
    );

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error(
          "Email request timed out after 10 seconds"
        );
        logger.error(`Email to ${options.email} timed out`, {
          subject: options.subject,
          error: timeoutError.message,
        });
        reject(timeoutError);
      }, 10000); // 10 seconds timeout
    });

    // Return the result of whichever promise resolves/rejects first
    return await Promise.race([emailPromise, timeoutPromise]);
  } catch (error) {
    logger.error(`Error sending email to ${options.email}:`, {
      subject: options.subject,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Send an email using MailerSend API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWithMailerSend = async (to, subject, htmlContent, textContent) => {
  // Check if MailerSend API key is set
  if (!process.env.MAILERSEND_API_KEY) {
    logger.error(
      "MailerSend API key is not configured. Please set MAILERSEND_API_KEY in .env file."
    );
    throw new Error("MailerSend API key is not configured");
  }

  // Log email configuration for troubleshooting
  logger.info("Email MailerSend API Configuration:", {
    apiKeyPresent: !!process.env.MAILERSEND_API_KEY,
    apiKeyLength: process.env.MAILERSEND_API_KEY
      ? process.env.MAILERSEND_API_KEY.length
      : 0,
    fromEmail: process.env.FROM_EMAIL || "noreply@mernappshopper.xyz",
  });

  try {
    // Define from email address
    const fromEmail = process.env.FROM_EMAIL || "noreply@mernappshopper.xyz";

    // Initialize MailerSend with API key
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    // Create sender and recipient objects
    const sentFrom = new Sender(fromEmail, "E-Commerce Store");
    const recipients = [
      new Recipient(to)
    ];

    // Create email parameters
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(htmlContent)
      .setText(textContent);

    // Send email
    const response = await mailerSend.email.send(emailParams);
    
    logger.info(`Email sent to ${to} with MailerSend API`);
    
    return {
      id: response?.body?.id || "unknown",
      provider: "mailersend",
    };
  } catch (error) {
    logger.error("MailerSend API error:", {
      error: error.message,
      to: to,
      subject: subject,
    });
    throw error;
  }
};

module.exports = sendEmail;
