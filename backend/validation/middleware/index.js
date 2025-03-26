/**
 * Export all validation middleware
 */

const userValidators = require("./userValidators");
const sanitizers = require("./sanitizers");

module.exports = {
  ...userValidators,
  ...sanitizers,
};
