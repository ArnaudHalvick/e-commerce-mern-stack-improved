# Email Service Setup Guide

This guide provides instructions for setting up the email service for the E-Commerce MERN application.

## Gmail SMTP Configuration (Current Implementation)

For portfolio projects or development environments, using Gmail with App Passwords provides a simple and cost-effective solution for sending emails.

### Prerequisites

- A Gmail account
- 2-Step Verification enabled on your Google Account

### Step 1: Enable 2-Step Verification

1. Go to your Google Account at [myaccount.google.com](https://myaccount.google.com/)
2. Navigate to the "Security" tab
3. Under "Signing in to Google," find "2-Step Verification" and turn it on
4. Follow the prompts to set up 2-Step Verification

### Step 2: Generate an App Password

1. Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (you may need to sign in again)
2. Under "Select app," choose "Other (Custom name)"
3. Enter a name for the app password (e.g., "E-Commerce MERN App")
4. Click "Generate"
5. Google will display a 16-character app password (four groups of four characters)
6. Copy this password (it will only be shown once)

### Step 3: Configure Environment Variables

1. Update your `.env` file with the following variables:

```
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Test Your Configuration

Run the test script to verify your email setup:

```bash
cd backend
node utils/emails/testEmail.js your-test-recipient@example.com
```

## Security Considerations

1. **App Password Security**:

   - App passwords provide access to your Gmail account, so keep them secure
   - Never expose them in client-side code or public repositories
   - If you suspect a breach, revoke the app password immediately from your Google Account

2. **Gmail Limitations**:

   - Gmail has daily sending limits: up to 500 emails per day for regular accounts
   - Gmail is designed for personal use, not for large-scale applications

3. **For Production**:
   - Consider dedicated email services like SendGrid, Mailgun, or Amazon SES
   - These services provide better deliverability, analytics, and higher sending limits

## Troubleshooting

1. **"Invalid login credentials"**:

   - Verify you're using the correct App Password, not your regular Gmail password
   - Ensure you've properly enabled 2-Step Verification
   - Try generating a new App Password

2. **Rate Limiting Issues**:

   - Gmail may rate-limit your sending if you send too many emails in a short period
   - Implement a retry mechanism for failed email attempts
   - Consider introducing a delay between email sends

3. **Email in Spam**:
   - Improve deliverability by setting up proper SPF, DKIM, and DMARC records (requires domain ownership)
   - Ensure your email content follows best practices to avoid spam filters

## Alternative Services

If you need more reliable email delivery for production, consider:

1. **SendGrid**: Great API, free tier includes 100 emails/day
2. **Mailgun**: Developer-friendly, 5,000 free emails/month for 3 months
3. **Amazon SES**: Very economical for high volume, 62,000 free emails/month if you're on EC2

To switch to another provider, update the transporter configuration in `sendEmail.js` based on the provider's documentation.
