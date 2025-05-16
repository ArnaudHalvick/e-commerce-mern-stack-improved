#!/bin/sh
set -e

# Load secrets if available
if [ -d "/app/secrets" ]; then
  echo "Secrets directory found, loading necessary secrets"
  
  # Example: Load API keys or other secrets as needed
  if [ -f "/app/secrets/access_token_secret" ]; then
    export VITE_ACCESS_TOKEN_SECRET=$(cat /app/secrets/access_token_secret)
    echo "Loaded access token secret"
  fi
  
  # Add more secrets as needed
fi

# Execute the command provided as arguments
exec "$@" 