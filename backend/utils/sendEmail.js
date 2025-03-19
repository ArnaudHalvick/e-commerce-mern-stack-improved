const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @param {string} options.html - Optional HTML content
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
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

    // Create HTML version if not provided but text is
    let htmlContent = options.html;
    if (!htmlContent && options.message) {
      // Convert plain text to basic HTML with clickable links
      htmlContent = options.message
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
      text: options.message, // Plain text version
      html: htmlContent, // HTML version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
