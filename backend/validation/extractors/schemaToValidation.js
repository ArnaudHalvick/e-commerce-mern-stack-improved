/**
 * Utility to extract validation rules from Mongoose schemas
 * This allows us to keep validation rules in one place and expose them to the frontend
 */

const mongoose = require("mongoose");

/**
 * Extract validation rules from a mongoose schema
 * @param {Object} schema - The mongoose schema object
 * @param {Array} fieldsToExclude - Fields to exclude from validation rules
 * @returns {Object} - Validation rules
 */
const extractValidationRules = (
  schema,
  fieldsToExclude = ["_id", "__v", "date", "password"]
) => {
  const validationRules = {};

  // Extract direct fields (not nested)
  Object.keys(schema.paths).forEach((path) => {
    if (fieldsToExclude.includes(path)) return;

    // Skip nested objects (we'll handle them separately)
    if (schema.paths[path].instance === "Object") return;

    const schemaType = schema.paths[path];
    validationRules[path] = extractFieldValidation(schemaType);
  });

  // Handle nested objects (like address)
  Object.keys(schema.paths).forEach((path) => {
    if (fieldsToExclude.includes(path)) return;

    const schemaType = schema.paths[path];

    // Skip non-objects
    if (schemaType.instance !== "Object") return;

    // For nested schema types
    if (schemaType.schema) {
      validationRules[path] = {};

      Object.keys(schemaType.schema.paths).forEach((nestedPath) => {
        if (fieldsToExclude.includes(nestedPath)) return;

        const nestedSchemaType = schemaType.schema.paths[nestedPath];
        validationRules[path][nestedPath] =
          extractFieldValidation(nestedSchemaType);
      });
    }
  });

  return validationRules;
};

/**
 * Extract validation rules for a single field
 * @param {Object} schemaType - The mongoose schema type
 * @returns {Object} - Validation rules for the field
 */
const extractFieldValidation = (schemaType) => {
  const rules = {};

  // Required
  if (schemaType.isRequired) {
    rules.required = true;

    // Get required message if available
    const requiredValidator = schemaType.validators.find(
      (v) => v.type === "required"
    );
    if (requiredValidator && requiredValidator.message) {
      rules.requiredMessage =
        typeof requiredValidator.message === "function"
          ? requiredValidator.message()
          : requiredValidator.message;
    }
  }

  // Min/max length
  if (schemaType.options.minLength) {
    // Handle minLength whether it's a number or an array [value, message]
    if (Array.isArray(schemaType.options.minLength)) {
      rules.minLength = schemaType.options.minLength[0]; // Just take the number
      if (!rules.message && schemaType.options.minLength[1]) {
        rules.message = schemaType.options.minLength[1];
      }
    } else {
      rules.minLength = schemaType.options.minLength;
    }
  }

  if (schemaType.options.maxLength) {
    // Handle maxLength whether it's a number or an array [value, message]
    if (Array.isArray(schemaType.options.maxLength)) {
      rules.maxLength = schemaType.options.maxLength[0]; // Just take the number
      if (!rules.message && schemaType.options.maxLength[1]) {
        rules.message = schemaType.options.maxLength[1];
      }
    } else {
      rules.maxLength = schemaType.options.maxLength;
    }
  }

  // Min/max value
  if (schemaType.options.min !== undefined) {
    rules.min = schemaType.options.min;
  }

  if (schemaType.options.max !== undefined) {
    rules.max = schemaType.options.max;
  }

  // Enum values
  if (schemaType.options.enum) {
    rules.enum = schemaType.options.enum;
  }

  // Regex pattern
  if (schemaType.options.match) {
    rules.pattern = schemaType.options.match[0].toString();
    // Remove leading/trailing slashes for frontend use
    rules.pattern = rules.pattern.replace(/^\/|\/[gimuy]*$/g, "");

    // Add message if available
    if (schemaType.options.match[1]) {
      rules.message = schemaType.options.match[1];
    }
  }

  // For custom validators with regex patterns
  if (schemaType.validators && schemaType.validators.length > 0) {
    schemaType.validators.forEach((validator) => {
      if (validator.type === "required") return; // Already handled

      // Extract regex pattern from validator function
      if (validator.validator && typeof validator.validator === "function") {
        const fnString = validator.validator.toString();
        // Look for regex literals in the function
        const regexMatch = fnString.match(/\/([^\/]+)\//);

        if (regexMatch && regexMatch[1]) {
          // Only extract actual regex patterns, not code snippets
          if (regexMatch[1].length < 100 && !regexMatch[1].includes("const")) {
            rules.pattern = regexMatch[1];
          }
        }

        // For password validation, explicitly extract requirements
        if (
          fnString.includes("hasUppercase") &&
          fnString.includes("hasNumber") &&
          fnString.includes("hasSpecial")
        ) {
          // Don't set a pattern, but extract the requirements for the UI
          rules.requiresUppercase = true;
          rules.requiresNumber = true;
          rules.requiresSpecial = true;
        }
      }

      // Get validation message
      if (validator.message) {
        rules.message =
          typeof validator.message === "function"
            ? validator.message({ value: "" })
            : validator.message;
      }
    });
  }

  return rules;
};

/**
 * Generic helper to extract validation from any mongoose model
 * @param {Object} model - Mongoose model
 * @param {Array} relevantFields - Fields to include in validation
 * @param {Object} customValidations - Additional validation rules
 * @returns {Object} - Combined validation rules
 */
const getModelValidation = (
  model,
  relevantFields = [],
  customValidations = {}
) => {
  if (!model || !model.schema) {
    throw new Error("A valid mongoose model must be provided");
  }

  const modelSchema = model.schema;

  // If relevant fields provided, exclude all other fields
  let fieldsToExclude = [];
  if (relevantFields.length > 0) {
    fieldsToExclude = Object.keys(modelSchema.paths).filter(
      (field) => !relevantFields.includes(field)
    );
  }

  // Extract basic validation from schema
  const validationRules = extractValidationRules(modelSchema, fieldsToExclude);

  // Merge with custom validations
  return deepMerge(validationRules, customValidations);
};

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge
 * @returns {Object} - Merged object
 */
const deepMerge = (target, source) => {
  const output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(output, { [key]: {} });
        output[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
};

/**
 * Check if value is an object
 * @param {*} item - Value to check
 * @returns {boolean} - True if object
 */
const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

module.exports = {
  extractValidationRules,
  extractFieldValidation,
  getModelValidation,
  deepMerge,
};
