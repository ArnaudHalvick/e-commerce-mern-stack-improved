#!/bin/bash

# Script to verify email service configuration
# Run this script on the production server to check email configuration
# Usage: bash verify-email-service.sh

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying Email Service Configuration...${NC}"

# Set a default .env file path, but allow overriding
ENV_FILE="${ENV_FILE:-/root/e-commerce-mern/.env}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE!${NC}"
    echo -e "${YELLOW}Trying current directory...${NC}"
    if [ -f ".env" ]; then
        ENV_FILE=".env"
        echo -e "${GREEN}Found .env file in current directory.${NC}"
    else
        echo -e "${RED}No .env file found in current directory either.${NC}"
        exit 1
    fi
fi

# Check if required variables are set in .env
echo -e "${YELLOW}Checking environment variables from $ENV_FILE...${NC}"

# Source .env to get variables
source "$ENV_FILE"

# Check MailerSend API Key
if [ -z "$MAILERSEND_API_KEY" ]; then
    echo -e "${RED}Error: MAILERSEND_API_KEY is not set in .env file!${NC}"
else
    echo -e "${GREEN}✓ MAILERSEND_API_KEY is set.${NC}"
    # Only show first 5 characters for security
    KEY_PREFIX="${MAILERSEND_API_KEY:0:5}..."
    echo -e "  Key prefix: ${KEY_PREFIX}"
fi

# Check FROM_EMAIL
if [ -z "$FROM_EMAIL" ]; then
    echo -e "${RED}Error: FROM_EMAIL is not set in .env file!${NC}"
    echo -e "${YELLOW}Using default value: noreply@mernappshopper.xyz${NC}"
    FROM_EMAIL="noreply@mernappshopper.xyz"
else
    echo -e "${GREEN}✓ FROM_EMAIL is set to: $FROM_EMAIL${NC}"
fi

# Check docker-compose environment if running in Docker
if command -v docker &> /dev/null && docker compose ps | grep -q "api"; then
    echo -e "\n${YELLOW}Checking Docker container environment...${NC}"
    docker compose exec api env | grep -i "MAILERSEND\|EMAIL" || echo -e "${YELLOW}No environment variables found in Docker container.${NC}"
else
    echo -e "\n${YELLOW}Not running in Docker or api container not found.${NC}"
fi

# Test connectivity to MailerSend API
echo -e "\n${YELLOW}Testing connectivity to MailerSend API...${NC}"
echo -e "Attempting to contact api.mailersend.com..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}\n" https://api.mailersend.com)

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "401" ]; then
    echo -e "${GREEN}✓ Successfully connected to MailerSend API (Status: $HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Failed to connect to MailerSend API (Status: $HTTP_STATUS)${NC}"
    echo -e "This could indicate network connectivity issues or firewall restrictions."
fi

# Prompt for test email recipient
echo -e "\n${YELLOW}Enter test email recipient (or press Enter to use admin@mernappshopper.xyz):${NC}"
read -r TEST_EMAIL_INPUT
TEST_EMAIL=${TEST_EMAIL_INPUT:-admin@mernappshopper.xyz}

# Test a basic email via REST API using curl
echo -e "\n${YELLOW}Testing sending an email via MailerSend REST API to ${TEST_EMAIL}...${NC}"

RESPONSE=$(curl -s -X POST 'https://api.mailersend.com/v1/email' \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Authorization: Bearer $MAILERSEND_API_KEY" \
  -d "{
    \"from\": {
        \"email\": \"$FROM_EMAIL\",
        \"name\": \"E-Commerce Store\"
    },
    \"to\": [{
        \"email\": \"$TEST_EMAIL\",
        \"name\": \"Test Recipient\"
    }],
    \"subject\": \"MailerSend Test Email\",
    \"html\": \"<p>This is a test email sent from verify-email-service.sh script at $(date).</p><p>Your email configuration is working correctly!</p>\"
  }")

if echo "$RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ Test email sent successfully!${NC}"
    echo -e "  Response: $RESPONSE"
elif echo "$RESPONSE" | grep -q "error"; then
    echo -e "${RED}✗ Failed to send test email!${NC}"
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d':' -f2- | tr -d '"')
    echo -e "  Error: ${ERROR_MSG:-$RESPONSE}"
else
    echo -e "${RED}✗ Failed to send test email!${NC}"
    echo -e "  Error: $RESPONSE"
fi

echo -e "\n${GREEN}Email service verification completed.${NC}"
echo -e "If you are still experiencing issues, please check the logs with: docker compose logs api" 