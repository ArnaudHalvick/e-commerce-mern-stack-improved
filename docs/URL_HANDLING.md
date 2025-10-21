# URL Handling in the Application

This document explains how URLs are handled in the application, especially for email verification and reset password links.

## Environment Variables

The application uses the following environment variables for URL handling:

- `FRONTEND_URL`: The URL of the frontend application (e.g., http://localhost:3000 in development or http://yourdomain.com in production)
- `PUBLIC_URL`: The URL of the backend API (e.g., http://localhost:4000 in development or http://yourdomain.com/api in production)

## URL Utilities

The `urlUtils.js` module provides utilities for working with URLs in a consistent manner:

- `getFrontendUrl()`: Gets the frontend URL from environment variables with a fallback to a default value
- `joinUrl(baseUrl, path)`: Safely joins a base URL with a path, ensuring there's exactly one slash between them
- `createVerificationUrl(token)`: Creates a complete verification URL for email verification
- `createPasswordResetUrl(token)`: Creates a complete password reset URL

## Email Templates

The email templates in `emailTemplates/authEmails.js` use these utilities to ensure that links in emails are correctly formed regardless of the environment.

## Docker Configuration

When running with Docker, environment variables are set in the `docker-compose.yml` file:

```yaml
environment:
  - FRONTEND_URL=http://yourdomain.com
  - PUBLIC_URL=http://yourdomain.com
```

## Development Setup

For local development, the environment variables are set in the `.env` file:

```
FRONTEND_URL=http://localhost:3000
PUBLIC_URL=http://localhost:4000
```

## Deployment Scripts

The deployment scripts (`set_env.sh` and `update_env.sh`) update the environment variables based on the target environment.

## Debugging URL Issues

If you encounter issues with URLs:

1. Check that `FRONTEND_URL` is correctly set in your environment
2. Verify that the `urlUtils.js` module is being used correctly
3. Use `console.log` to debug URL construction if needed

## Common Problems and Solutions

### "undefined" in URLs

If you see "undefined" in URLs, it usually means the environment variable is not set or not being loaded correctly.

Solution: Make sure your `.env` file has the correct values and that `dotenv` is being used to load them.

### Double Slashes in URLs

If you see URLs with double slashes (e.g., `http://example.com//verify`), it means the base URL and path are not being joined correctly.

Solution: Use the `joinUrl` function from `urlUtils.js` to ensure proper URL construction.
