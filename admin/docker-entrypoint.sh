#!/bin/sh
set -e

echo "Starting admin docker-entrypoint.sh script"

# Create directories if they don't exist
mkdir -p /run/secrets

# Check for Nginx configuration
echo "Verifying nginx configuration exists:"
ls -la /etc/nginx/conf.d/

# Replace VITE_API_URL_PLACEHOLDER with actual value if provided
if [ -n "$API_URL" ]; then
  echo "Replacing API URL placeholder with: $API_URL"
  find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_API_URL_PLACEHOLDER|$API_URL|g" {} \;
  echo "API URL replacement completed"
fi

# Create runtime config for more complex cases
if [ -n "$API_URL" ]; then
  echo "Creating runtime config with API_URL: $API_URL"
  mkdir -p /usr/share/nginx/html/config
  
  # Get host URL from environment or use default
  HOST_URL=${HOST_URL:-"https://admin.mernappshopper.xyz"}
  echo "Using HOST_URL: $HOST_URL for runtime config"
  
  # Explicitly set VITE_IS_DOCKER=false in production runtime config
  # Place runtime config in both locations for compatibility
  echo "window.RUNTIME_CONFIG = { apiUrl: '$API_URL', hostUrl: '$HOST_URL', basePath: '/', isDocker: false };" > /usr/share/nginx/html/config/runtime-config.js
  echo "window.RUNTIME_CONFIG = { apiUrl: '$API_URL', hostUrl: '$HOST_URL', basePath: '/', isDocker: false };" > /usr/share/nginx/html/runtime-config.js
  
  # Inject runtime config script into index.html if not already there
  if ! grep -q "runtime-config.js" /usr/share/nginx/html/index.html; then
    echo "Injecting runtime config script into index.html"
    sed -i 's|</head>|  <script src="/runtime-config.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
  fi
  
  # Debug: Print a few lines of one of the main JS files
  echo "Checking JS bundle for API URLs:"
  MAIN_JS=$(find /usr/share/nginx/html/assets -type f -name "index-*.js" | head -1)
  if [ -n "$MAIN_JS" ]; then
    echo "Found main JS file: $MAIN_JS"
    grep -n "api/admin/auth" "$MAIN_JS" | head -5
    grep -n "$API_URL" "$MAIN_JS" | head -5
  else
    echo "No main JS file found."
  fi
fi

# Display directory structure for debugging
echo "Listing HTML directory structure:"
ls -la /usr/share/nginx/html/
echo "Listing assets directory:"
ls -la /usr/share/nginx/html/assets/ || echo "Assets directory not found"

# Check Nginx configuration
echo "Verifying nginx configuration:"
nginx -t

echo "Admin entrypoint script completed, executing: $@"
# Execute the command provided as arguments
exec "$@" 