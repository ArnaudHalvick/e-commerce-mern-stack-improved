// backend/utils/emails/sendEmail.js

const https = require("https");
const logger = require("../common/logger");

/**
 * Send an email using Resend REST API
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
    const emailPromise = sendWithRestAPI(
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
 * Send an email using Resend REST API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWithRestAPI = async (to, subject, htmlContent, textContent) => {
  // Check if Resend API key is set
  if (!process.env.RESEND_API_KEY) {
    logger.error(
      "Resend API key is not configured. Please set RESEND_API_KEY in .env file."
    );
    throw new Error("Resend API key is not configured");
  }

  // Log email configuration for troubleshooting
  logger.info("Email REST API Configuration:", {
    apiKeyPresent: !!process.env.RESEND_API_KEY,
    apiKeyLength: process.env.RESEND_API_KEY
      ? process.env.RESEND_API_KEY.length
      : 0,
    fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",
  });

  // Define from email address
  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  // Prepare the sender with a friendly name
  const sender = `E-Commerce Store <${fromEmail}>`;

  return new Promise((resolve, reject) => {
    // Prepare the request data
    const payload = {
      from: sender,
      to: Array.isArray(to) ? to : [to], // Ensure 'to' is always an array
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    const data = JSON.stringify(payload);

    // Log the complete request payload for debugging
    logger.info(`Sending email to ${to} via Resend REST API`, {
      from: sender,
      to: payload.to,
      subject: subject,
      dataSize: data.length,
      // Include sanitized payload without HTML content to avoid huge logs
      payload: {
        ...payload,
        html: payload.html
          ? `[HTML content: ${payload.html.length} chars]`
          : null,
        text: payload.text
          ? `[Text content: ${payload.text.length} chars]`
          : null,
      },
    });

    // Configure the request options
    const options = {
      hostname: "api.resend.com",
      port: 443,
      path: "/emails",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Length": data.length,
      },
      timeout: 10000, // 10 second timeout
    };

    // Send the request
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsedData = JSON.parse(responseData);
            logger.info(
              `Email sent to ${to} with Resend REST API: ${parsedData.id}`
            );
            resolve({
              id: parsedData.id,
              rest: true,
            });
          } else {
            logger.error(
              `Resend REST API error (${res.statusCode}): ${responseData}`
            );
            reject(new Error(`Resend API error: ${responseData}`));
          }
        } catch (error) {
          logger.error("Error parsing Resend API response:", {
            error: error.message,
            responseData,
            statusCode: res.statusCode,
          });
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      logger.error("Resend REST API request error:", {
        error: error.message,
        to: to,
        subject: subject,
      });
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      logger.error("Resend REST API request timed out", {
        to: to,
        subject: subject,
      });
      reject(new Error("REST API request timed out"));
    });

    // Write data to request body
    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;
