#!/bin/sh
set -e

# Load MailerSend API Key from secrets
if [ -f "/app/secrets/mailersend_api_key" ]; then
  export MAILERSEND_API_KEY=$(cat /app/secrets/mailersend_api_key)
  echo "Loaded MailerSend API key from secrets"
else
  echo "Note: No MailerSend API key secret found, using value from .env.local"
fi

# Load Stripe API Keys from secrets
if [ -f "/app/secrets/stripe_publishable_key" ]; then
  export STRIPE_PUBLISHABLE_KEY=$(cat /app/secrets/stripe_publishable_key)
  echo "Loaded Stripe publishable key from secrets"
else
  echo "Note: No Stripe publishable key secret found, using value from .env.local"
fi

if [ -f "/app/secrets/stripe_secret_key" ]; then
  export STRIPE_SECRET_KEY=$(cat /app/secrets/stripe_secret_key)
  echo "Loaded Stripe secret key from secrets"
else
  echo "Note: No Stripe secret key secret found, using value from .env.local"
fi

if [ -f "/app/secrets/stripe_webhook_secret" ]; then
  export STRIPE_WEBHOOK_SECRET=$(cat /app/secrets/stripe_webhook_secret)
  echo "Loaded Stripe webhook secret from secrets"
else
  echo "Note: No Stripe webhook secret found, using value from .env.local"
fi

# Load token secrets
if [ -f "/app/secrets/access_token_secret" ]; then
  export ACCESS_TOKEN_SECRET=$(cat /app/secrets/access_token_secret)
  echo "Loaded access token secret from secrets"
else
  echo "Note: No access token secret found, using value from .env.local"
fi

if [ -f "/app/secrets/refresh_token_secret" ]; then
  export REFRESH_TOKEN_SECRET=$(cat /app/secrets/refresh_token_secret)
  echo "Loaded refresh token secret from secrets"
else
  echo "Note: No refresh token secret found, using value from .env.local"
fi

# Load MongoDB credentials
if [ -f "/app/secrets/mongodb_credentials" ]; then
  export MONGODB_URI=$(cat /app/secrets/mongodb_credentials)
  echo "Loaded MongoDB credentials from secrets"
else
  echo "Note: No MongoDB credentials found, using value from .env.local"
fi

# Execute the command provided as arguments
exec "$@" 