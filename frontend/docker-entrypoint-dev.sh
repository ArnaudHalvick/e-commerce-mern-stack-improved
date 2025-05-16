#!/bin/sh
set -e

# Load Stripe Publishable Key from secrets
if [ -f "/app/secrets/stripe_publishable_key" ]; then
  export REACT_APP_STRIPE_PUBLISHABLE_KEY=$(cat /app/secrets/stripe_publishable_key)
  echo "Loaded Stripe publishable key from secrets"
else
  echo "Warning: No Stripe publishable key secret found"
fi

# Load other secrets as needed
if [ -f "/app/secrets/stripe_secret_key" ]; then
  export STRIPE_SECRET_KEY=$(cat /app/secrets/stripe_secret_key)
  echo "Loaded Stripe secret key from secrets"
fi

if [ -f "/app/secrets/stripe_webhook_secret" ]; then
  export STRIPE_WEBHOOK_SECRET=$(cat /app/secrets/stripe_webhook_secret)
  echo "Loaded Stripe webhook secret from secrets"
fi

# Ensure development environment is properly set
echo "NODE_ENV: $NODE_ENV"
echo "REACT_APP_ENV: $REACT_APP_ENV"
echo "REACT_APP_API_URL: $REACT_APP_API_URL"

# Execute the command provided as arguments
exec "$@" 