# Postman Collection and Environment Setup Guide

This guide explains how to import and set up the Postman collection for the E-Commerce MERN Stack API, along with environment variables.

## Importing the Collection

1. Open Postman
2. Click on the "Import" button in the top left corner
3. Choose "File" and select the `SHOPPER_API_COLLECTION.json` file from this directory
4. The collection will be imported with all endpoints organized by category

## Setting Up Environment Variables

The collection uses the `{{URL}}` variable to reference the base URL of the API. You'll need to set up an environment to use this variable.

### Creating an Environment

1. Click on the "Environments" tab in Postman (or the gear icon in the top right)
2. Click "Add" to create a new environment
3. Name your environment (e.g., "E-Commerce API - Development")
4. Add the following variables:

| VARIABLE   | INITIAL VALUE         | CURRENT VALUE         |
| ---------- | --------------------- | --------------------- |
| URL        | http://localhost:4000 | http://localhost:4000 |
| auth_token | (Leave empty)         | (Leave empty)         |

5. Click "Save"

For production or other environments, you can create additional environments with different URL values:

- Development: `http://localhost:4000`
- Production: `https://mernappshopper.xyz`

### Using the Environment

1. Select your environment from the environment dropdown in the top right corner of Postman
2. The collection will now use the base URL from your selected environment
3. The `Login` request in the collection is configured with a test script that automatically saves the authentication token to the `auth_token` variable, which will be used by all authenticated requests

## Making Requests

1. Navigate to the desired request in the collection
2. Fill in any required parameters in the request body or URL
3. For authenticated endpoints, make sure you've called the Login endpoint first to get a valid token
4. Click "Send" to make the request

## Testing Authentication Flow

To test the complete authentication flow:

1. Use the "Sign Up" request to create an account
2. Use the "Login" request to authenticate (this will automatically save your token)
3. Use any of the authenticated endpoints (they will automatically use the saved token)

## Using Path Variables

Many endpoints in the collection use path variables (like `:productId`, `:reviewId`, etc.). To use these:

1. Navigate to the request
2. In the "Path Variables" section under the URL, replace the placeholder values with actual IDs

## Using Collection Runner

You can also use Postman's Collection Runner to run a sequence of requests, which is useful for testing entire workflows:

1. Click the "Runner" button in Postman
2. Select the E-Commerce API collection or a specific folder
3. Configure the run order and parameters
4. Click "Run" to execute the requests in sequence

## Troubleshooting

- If you receive 401 Unauthorized errors, make sure your token is valid by logging in again
- If the URL is not resolving, check that your environment is selected and the URL variable is set correctly
- For any response errors, check the response body for detailed error messages provided by the API's error handling system
