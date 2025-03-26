/**
 * Export all validation middleware
 */

const userValidators = require("./userValidators");

module.exports = {
  ...userValidators,
};
