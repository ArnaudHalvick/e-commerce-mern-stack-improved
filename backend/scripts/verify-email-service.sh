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

# Check Resend API Key
if [ -z "$RESEND_API_KEY" ]; then
    echo -e "${RED}Error: RESEND_API_KEY is not set in .env file!${NC}"
else
    echo -e "${GREEN}✓ RESEND_API_KEY is set.${NC}"
    # Only show first 5 characters for security
    KEY_PREFIX="${RESEND_API_KEY:0:5}..."
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
docker compose exec api env | grep -i "RESEND\|EMAIL"

# Test connectivity to Resend API
echo -e "\n${YELLOW}Testing connectivity to Resend API...${NC}"
echo -e "Attempting to contact api.resend.com..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}\n" https://api.resend.com)

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Successfully connected to Resend API (Status: $HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Failed to connect to Resend API (Status: $HTTP_STATUS)${NC}"
    echo -e "This could indicate network connectivity issues or firewall restrictions."
fi

# Test a basic email via REST API using curl
echo -e "\n${YELLOW}Testing sending an email via Resend REST API...${NC}"
TEST_EMAIL="delivered@resend.dev"  # Resend test email address

RESPONSE=$(curl -s -X POST 'https://api.resend.com/emails' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -d "{
    \"from\": \"E-Commerce Store <$FROM_EMAIL>\",
    \"to\": [\"$TEST_EMAIL\"],
    \"subject\": \"Email Test\",
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