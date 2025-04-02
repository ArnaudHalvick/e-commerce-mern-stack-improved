# Profile Components Validation

## Overview

All profile components use the centralized validation utilities from `utils/validation.js` and validation schemas from `utils/validationSchemas.js`. This ensures consistency across the application and follows the DRY (Don't Repeat Yourself) principle.

## Validation Approach

1. **Form-level validation** is handled in the custom hooks:

   - `useProfileForm` - Uses `validateForm` with `profileBasicInfoSchema` and `profileAddressSchema`
   - `usePasswordForm` - Uses `validateForm` with `profilePasswordChangeSchema`

2. **Field-level validation** is handled in the components:
   - BasicInfoSection - Uses `validateName` and `validatePhone`
   - ShippingAddressSection - Uses `validateAddress`
   - PasswordManager - Uses `validatePassword` and `validatePasswordMatch`

## Validation Flow

1. When a user inputs data, individual field validation is performed with debounced validation
2. Before form submission, complete form validation is performed
3. Error messages are displayed next to the corresponding fields

## Benefits

- Consistent validation rules across the application
- Central place to update validation logic
- Reduced code duplication
- Easier to maintain and extend

## Important Note

Do not implement custom validation logic in the components. Always use the validation utilities from `utils/validation.js`. If you need to add new validation rules, update the validation schemas in `utils/validationSchemas.js`.
