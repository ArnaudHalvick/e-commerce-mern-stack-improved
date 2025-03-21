/**
 * Utility to extract validation rules from Mongoose schemas
 * This allows us to keep validation rules in one place and expose them to the frontend
 */

const User = require("../models/User");
const validators = require("../middleware/validators");

/**
 * Extract validation rules from a mongoose schema
 * @param {Object} mongooseSchema - The mongoose schema object
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
    rules.minLength = schemaType.options.minLength;
  }

  if (schemaType.options.maxLength) {
    rules.maxLength = schemaType.options.maxLength;
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
  }

  // Custom validators
  if (schemaType.validators && schemaType.validators.length > 0) {
    // Extract validation messages
    schemaType.validators.forEach((validator) => {
      if (validator.type === "required") return; // Already handled

      // For custom validators, get the message
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
 * Get validation rules for user profile fields
 * @returns {Object} - Validation rules for user profile
 */
const getUserProfileValidation = () => {
  // Start with schema-based validation rules
  const userModel = User.schema;

  // Fields relevant to the profile form
  const relevantFields = ["name", "phone", "address", "email"];
  const fieldsToExclude = Object.keys(userModel.paths).filter(
    (field) => !relevantFields.includes(field)
  );

  // Extract basic validation
  const validationRules = extractValidationRules(userModel, fieldsToExclude);

  // Add any middleware validation rules
  // Phone validation from middleware
  if (!validationRules.phone) {
    validationRules.phone = {};
  }
  validationRules.phone.pattern = "^[0-9]{10,15}$";
  validationRules.phone.message = "Phone number must contain 10-15 digits";

  // Make sure email validation is included
  if (!validationRules.email) {
    validationRules.email = {};
  }

  // If email pattern wasn't extracted from schema, add it manually
  if (!validationRules.email.pattern) {
    validationRules.email.pattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
    validationRules.email.message = "Please enter a valid email address";
  }

  // Address validations from middleware
  if (!validationRules.address) {
    validationRules.address = {};
  }

  // Street validation
  if (!validationRules.address.street) {
    validationRules.address.street = {};
  }
  validationRules.address.street.minLength = 3;
  validationRules.address.street.message =
    "Street address must be at least 3 characters long";

  // City validation
  if (!validationRules.address.city) {
    validationRules.address.city = {};
  }
  validationRules.address.city.minLength = 2;
  validationRules.address.city.message =
    "City must be at least 2 characters long";

  // State validation
  if (!validationRules.address.state) {
    validationRules.address.state = {};
  }
  validationRules.address.state.minLength = 2;
  validationRules.address.state.message =
    "State must be at least 2 characters long";

  // Zip code validation
  if (!validationRules.address.zipCode) {
    validationRules.address.zipCode = {};
  }
  validationRules.address.zipCode.pattern = "^[0-9a-zA-Z\\-\\s]{3,10}$";
  validationRules.address.zipCode.message =
    "Please enter a valid zip/postal code";

  // Country validation
  if (!validationRules.address.country) {
    validationRules.address.country = {};
  }
  validationRules.address.country.minLength = 2;
  validationRules.address.country.message =
    "Country must be at least 2 characters long";

  return validationRules;
};

/**
 * Get validation rules for password change
 * @returns {Object} - Validation rules for password change
 */
const getPasswordChangeValidation = () => {
  return {
    currentPassword: {
      required: true,
      requiredMessage: "Current password is required",
    },
    newPassword: {
      required: true,
      requiredMessage: "New password is required",
      minLength: 8,
      pattern:
        "[A-Z].*[0-9].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[0-9].*[A-Z].*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]|[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*[A-Z].*[0-9]",
      message:
        "Password must contain at least 1 uppercase letter, 1 number, and 1 special character",
    },
    confirmPassword: {
      required: true,
      requiredMessage: "Please confirm your password",
      message: "Passwords must match",
    },
  };
};

module.exports = {
  extractValidationRules,
  getUserProfileValidation,
  getPasswordChangeValidation,
};
