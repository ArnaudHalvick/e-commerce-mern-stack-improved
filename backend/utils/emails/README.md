# Email Utilities

This directory contains utilities for email functionality in the application, including email templating, sending capabilities, and email address normalization.

## Components

- **sendEmail.js** - Core utility for sending emails using Resend API
- **emailNormalizer.js** - Utility for normalizing and validating email addresses
- **templates/** - Directory containing email templates for various user actions

## Usage

### Sending an Email

```javascript
const sendEmail = require("../utils/emails/sendEmail");

await sendEmail({
  email: "recipient@example.com",
  subject: "Welcome to our store!",
  html: "<h1>Welcome</h1><p>Thank you for joining our platform.</p>",
});
```

### Normalizing Email Addresses

```javascript
const { normalizeEmail } = require("../utils/emails/emailNormalizer");

const normalizedEmail = normalizeEmail("User.Name+TAG@Gmail.com");
// Outputs: username@gmail.com
```

## Configuration

Email functionality requires the following environment variables:

- `RESEND_API_KEY` - Your Resend API key
- `FROM_EMAIL` - Email address to use as sender (defaults to "onboarding@resend.dev")

## Best Practices

- Always use email templates for consistent branding
- Include both HTML and text versions for better deliverability
- Implement proper error handling for email sending failures
- Use email normalization for user inputs to prevent duplicate accounts
