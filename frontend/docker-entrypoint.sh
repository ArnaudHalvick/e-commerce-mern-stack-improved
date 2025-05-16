#!/bin/sh
set -e

echo "Starting frontend docker-entrypoint.sh script"

# Create directories if they don't exist
mkdir -p /run/secrets

# Display some debugging info
echo "Checking Nginx configuration..."
ls -la /etc/nginx/conf.d/
echo "Checking frontend files..."
ls -la /usr/share/nginx/html/

# Check if admin directory exists (it shouldn't in this container)
if [ -d "/usr/share/nginx/html/admin" ]; then
  echo "Checking admin files..."
  ls -la /usr/share/nginx/html/admin/
else
  echo "Admin directory not found (expected in this container)"
fi

# Replace Stripe key placeholder in main frontend JavaScript files
if [ -f /run/secrets/stripe_publishable_key ]; then
  STRIPE_KEY=$(cat /run/secrets/stripe_publishable_key)
  echo "Injecting Stripe publishable key"
  
  # Find main.js (or similar) file in the frontend build
  JS_FILES=$(find /usr/share/nginx/html -maxdepth 1 -name "*.js")
  
  for JS_FILE in $JS_FILES; do
    echo "Processing frontend JS file: $JS_FILE"
    # Replace placeholder with actual key
    sed -i "s/STRIPE_PUBLISHABLE_KEY_PLACEHOLDER/$STRIPE_KEY/g" $JS_FILE
  done
else
  echo "Warning: Stripe key not found in /run/secrets/stripe_publishable_key"
fi

# Inject runtime API URL if needed
if [ -n "$API_URL" ]; then
  echo "Setting runtime API URL to: $API_URL"
  
  # Find all JavaScript files
  JS_FILES=$(find /usr/share/nginx/html -type f -name "*.js")
  
  for JS_FILE in $JS_FILES; do
    # Replace API URL placeholder with actual URL
    sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$API_URL|g" $JS_FILE
  done
  
  # Create runtime config
  echo "Creating runtime config with API_URL: $API_URL"
  mkdir -p /usr/share/nginx/html/config
  
  echo "window.RUNTIME_CONFIG = { apiUrl: '$API_URL' };" > /usr/share/nginx/html/config/runtime-config.js
  
  if ! grep -q "runtime-config.js" /usr/share/nginx/html/index.html; then
    echo "Injecting runtime config script into index.html"
    sed -i 's|</head>|  <script src="/config/runtime-config.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
  fi
fi

# Verify the final nginx config
echo "Final nginx configuration:"
cat /etc/nginx/conf.d/default.conf

echo "Frontend entrypoint script completed, starting Nginx"
# Execute the CMD
exec "$@" 