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

# Check if .env file exists
if [ ! -f "/root/e-commerce-mern/.env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    exit 1
fi

# Check if required variables are set in .env
echo -e "${YELLOW}Checking environment variables...${NC}"

# Source .env to get variables
source /root/e-commerce-mern/.env

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
else
    echo -e "${GREEN}✓ FROM_EMAIL is set to: $FROM_EMAIL${NC}"
fi

# Check docker-compose environment
echo -e "\n${YELLOW}Checking Docker container environment...${NC}"
docker compose exec api env | grep -i "MAILERSEND\|EMAIL"

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

# Test a basic email via REST API using curl
echo -e "\n${YELLOW}Testing sending an email via MailerSend REST API...${NC}"
TEST_EMAIL="delivered@resend.dev"  # Using Resend's test email address for testing

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
    \"html\": \"<p>This is a test email sent from verify-email-service.sh script.</p>\"
  }")

if echo "$RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ Test email sent successfully!${NC}"
    echo -e "  Response: $RESPONSE"
else
    echo -e "${RED}✗ Failed to send test email!${NC}"
    echo -e "  Error: $RESPONSE"
fi

echo -e "\n${GREEN}Email service verification completed.${NC}"
echo -e "If you are still experiencing issues, please check the logs with: docker compose logs api" 