# Email Utilities

This directory contains utilities for email functionality in the application, including email templating, sending capabilities, and email address normalization.

## Components

- **sendEmail.js** - Core utility for sending emails using MailerSend API
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

- `MAILERSEND_API_KEY` - Your MailerSend API key
- `FROM_EMAIL` - Email address to use as sender (defaults to "noreply@mernappshopper.xyz")

## Testing the Email Configuration

We've provided a verification script to test the email sending functionality:

```bash
# Make sure you update the recipient email in the script first
node scripts/verify-mailersend.js
```

## Best Practices

- Always use email templates for consistent branding
- Include both HTML and text versions for better deliverability
- Implement proper error handling for email sending failures
- Use email normalization for user inputs to prevent duplicate accounts

## MailerSend Setup

1. Create a domain in MailerSend and verify it with DNS settings
2. Create an API key with appropriate permissions
3. Set the API key in your .env files as MAILERSEND_API_KEY
4. Set the FROM_EMAIL to your verified domain email
