// backend/utils/emails/templates/authEmails.js

/**
 * Auth-related email templates
 * This module contains all email templates related to authentication
 */

const { getFrontendUrl, joinUrl } = require("../../common/urlUtils");

/**
 * Shared email styles for all authentication emails
 * Centralized in one place for easier maintenance
 */
const emailStyles = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .email-container {
    border: 1px solid #e1e1e1;
    border-radius: 5px;
    padding: 25px;
    background-color: #f9f9f9;
  }
  .header {
    text-align: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #e1e1e1;
    margin-bottom: 20px;
  }
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: #f85606;
  }
  h1 {
    color: #f85606;
    margin-top: 0;
  }
  /* Button styles with enhanced specificity to override email client styles */
  .email-container a.btn {
    display: inline-block;
    background-color: #f85606 !important;
    color: white !important;
    text-decoration: none !important;
    padding: 12px 25px !important;
    border-radius: 4px !important;
    margin: 20px 0 !important;
    font-weight: bold !important;
    border: 1px solid #f85606 !important;
    font-family: Arial, sans-serif !important;
    text-align: center !important;
    mso-line-height-rule: exactly;
    line-height: 100% !important;
  }
  .footer {
    margin-top: 30px;
    text-align: center;
    font-size: 12px;
    color: #777;
  }
  .warning {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    color: #856404;
    padding: 10px;
    border-radius: 4px;
    margin: 15px 0;
  }
  .alert {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
    color: #155724;
    padding: 10px;
    border-radius: 4px;
    margin: 15px 0;
  }
  .code-block {
    word-break: break-all;
    background-color: #eee;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
  }
`;

/**
 * Common email HTML layout wrapper
 * @param {string} title - Email title
 * @param {string} content - Email HTML content
 * @returns {string} - Complete HTML email
 */
const emailTemplate = (title, content) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${emailStyles}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">E-Commerce Store</div>
    </div>
    
    ${content}
    
    <div class="footer">
      <p>This is an automated email, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} E-Commerce Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML for email verification email
 * @param {string} verificationURL - The verification URL to include in the email
 * @param {Object} options - Additional options for customizing the email
 * @param {boolean} options.isEmailChange - Whether this is for an email change
 * @param {string} options.user - User's name
 * @param {string} options.newEmail - The new email address for email change
 * @returns {string} - HTML content for email
 */
const generateVerificationEmail = (verificationURL, options = {}) => {
  const { isEmailChange, newEmail } = options;

  // Dynamic content based on email type
  const title = isEmailChange
    ? "Verify Your Email Change"
    : "Verify Your Email Address";
  const mainContent = isEmailChange
    ? `<p>You recently requested to change your email address from your current email to <strong>${newEmail}</strong>. To complete this change, please verify your new email address.</p>`
    : `<p>Thank you for signing up! To complete your registration and access all features, please verify your email address.</p>`;

  const buttonText = isEmailChange
    ? "Confirm Email Change"
    : "Verify Email Address";

  const warningText = isEmailChange
    ? "If you did not request this email change, please contact support immediately or change your password to secure your account."
    : "If you did not sign up for an account, please disregard this email.";

  const content = `
    <h1>${title}</h1>
    
    ${mainContent}
    
    <p style="text-align: center;">
      <a href="${verificationURL}" class="btn" target="_blank">${buttonText}</a>
    </p>
    
    <p>If the button above doesn't work, you can also verify by copying and pasting the following URL into your browser:</p>
    
    <p class="code-block">
      ${verificationURL}
    </p>
    
    <p>This verification link will expire in 24 hours.</p>
    
    <p>${warningText}</p>
  `;

  return emailTemplate(title, content);
};

/**
 * Generate HTML for password reset email
 * @param {string} resetURL - The password reset URL to include in the email
 * @returns {string} - HTML content for email
 */
const generatePasswordResetEmail = (resetURL) => {
  const title = "Reset Your Password";

  const content = `
    <h1>${title}</h1>
    
    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
    
    <p style="text-align: center;">
      <a href="${resetURL}" class="btn" target="_blank">Reset Your Password</a>
    </p>
    
    <p>If the button above doesn't work, you can also reset your password by copying and pasting the following URL into your browser:</p>
    
    <p class="code-block">
      ${resetURL}
    </p>
    
    <div class="warning">
      <p><strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.</p>
    </div>
    
    <p>If you didn't request a password reset, please contact our support team immediately.</p>
  `;

  return emailTemplate(title, content);
};

/**
 * Generate HTML for password change notification email
 * @param {string} name - User's name
 * @returns {string} - HTML content for email
 */
const generatePasswordChangeNotification = (name) => {
  const loginUrl = joinUrl(getFrontendUrl(), "login");
  const title = "Password Changed";

  const content = `
    <h1>${title}</h1>
    
    <p>Hello ${name},</p>
    
    <div class="alert">
      <p>Your password has been changed successfully.</p>
    </div>
    
    <p>This email confirms that your password for your E-Commerce Store account has been changed.</p>
    
    <p>If you did not make this change, please contact our support team immediately as your account may have been compromised.</p>
    
    <p style="text-align: center;">
      <a href="${loginUrl}" class="btn" target="_blank">Login to Your Account</a>
    </p>
  `;

  return emailTemplate(title, content);
};

module.exports = {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordChangeNotification,
};
