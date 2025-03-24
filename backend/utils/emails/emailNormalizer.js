// backend/utils/emailNormalizer.js

/**
 * Email normalization utility
 *
 * Handles special cases like Gmail where dots in the local part are ignored
 * For example: john.doe@gmail.com is the same account as johndoe@gmail.com
 */

/**
 * Normalizes email addresses to ensure uniqueness check works correctly
 * Specifically handles Gmail's dot-insensitive addressing
 *
 * @param {string} email - The email address to normalize
 * @returns {string} - The normalized email address
 */
const normalizeEmail = (email) => {
  if (!email) return email;

  email = email.toLowerCase().trim();

  // Extract the local part (before @) and domain part (after @)
  const [localPart, domain] = email.split("@");

  // If it's a Gmail address, remove all dots from the local part
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Remove dots from local part and remove everything after +
    const normalizedLocalPart = localPart
      .replace(/\./g, "") // Remove all dots
      .split("+")[0]; // Remove everything after +

    return `${normalizedLocalPart}@${domain}`;
  }

  // For other email providers, just return lowercase version
  return email;
};

module.exports = { normalizeEmail };
