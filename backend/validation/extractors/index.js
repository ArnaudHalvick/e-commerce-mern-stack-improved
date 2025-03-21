/**
 * Export all validation extractors
 */

const schemaValidation = require("./schemaToValidation");
const modelValidations = require("./modelValidations");

module.exports = {
  ...schemaValidation,
  ...modelValidations,
};
