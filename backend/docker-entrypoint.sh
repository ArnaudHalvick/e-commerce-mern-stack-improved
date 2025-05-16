#!/bin/sh
set -e

echo "Starting backend docker-entrypoint.sh script"

# Load secrets from files and set as environment variables
if [ -f "/app/secrets/stripe_publishable_key" ]; then
  export STRIPE_PUBLISHABLE_KEY=$(cat /app/secrets/stripe_publishable_key)
  echo "Loaded Stripe publishable key from secrets"
else
  echo "Warning: No Stripe publishable key secret found"
fi

if [ -f "/app/secrets/stripe_secret_key" ]; then
  export STRIPE_SECRET_KEY=$(cat /app/secrets/stripe_secret_key)
  echo "Loaded Stripe secret key from secrets"
else
  echo "Warning: No Stripe secret key secret found"
fi

if [ -f "/app/secrets/stripe_webhook_secret" ]; then
  export STRIPE_WEBHOOK_SECRET=$(cat /app/secrets/stripe_webhook_secret)
  echo "Loaded Stripe webhook secret from secrets"
else
  echo "Warning: No Stripe webhook secret found"
fi

if [ -f "/app/secrets/mailersend_api_key" ]; then
  export MAILERSEND_API_KEY=$(cat /app/secrets/mailersend_api_key)
  echo "Loaded MailerSend API key from secrets"
else
  echo "Warning: No MailerSend API key secret found"
fi

if [ -f "/app/secrets/access_token_secret" ]; then
  export ACCESS_TOKEN_SECRET=$(cat /app/secrets/access_token_secret)
  echo "Loaded access token secret from secrets"
else
  echo "Warning: No access token secret found"
fi

if [ -f "/app/secrets/refresh_token_secret" ]; then
  export REFRESH_TOKEN_SECRET=$(cat /app/secrets/refresh_token_secret)
  echo "Loaded refresh token secret from secrets"
else
  echo "Warning: No refresh token secret found"
fi

# Load MongoDB credentials
if [ -f "/app/secrets/mongodb_credentials" ]; then
  export MONGODB_URI=$(cat /app/secrets/mongodb_credentials)
  # Extract username and password from the URI
  DB_URI_PART=$(echo $MONGODB_URI | cut -d'@' -f1)
  export DB_USERNAME=$(echo $DB_URI_PART | cut -d'/' -f3 | cut -d':' -f1)
  export DB_PASSWORD=$(echo $DB_URI_PART | cut -d':' -f3)
  echo "Loaded MongoDB credentials from secrets"
else
  echo "Warning: No MongoDB credentials found"
fi

# Create upload directories if they don't exist
mkdir -p /app/upload/images/placeholders
echo "Ensured upload directories exist"

# Execute the command provided as arguments based on NODE_ENV
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting in development mode"
  exec npm run dev
else
  echo "Starting in production mode"
  exec npm run prod
fi 