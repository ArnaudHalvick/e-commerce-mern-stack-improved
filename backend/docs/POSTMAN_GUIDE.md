# Postman Collection Guide

This guide explains how to use the Postman collection file to test the API endpoints of the e-commerce backend.

## Getting Started

1. Download [Postman](https://www.postman.com/downloads/) if you don't have it installed already.
2. Import the `postman_collection.json` file into Postman:
   - Open Postman
   - Click on "Import" in the top left corner
   - Drag and drop the `postman_collection.json` file or browse to find it
   - Click "Import"

## Environment Setup

1. Create a new environment in Postman:

   - Click on "Environments" in the sidebar
   - Click "+" to create a new environment
   - Name it "E-Commerce Local"
   - Add the following variables:
     - `accessToken` (leave the value empty for now)
     - `productId` (leave the value empty for now)
     - `productSlug` (leave the value empty for now)
     - `verificationToken` (leave the value empty for now)
   - Click "Save"

2. Select your new environment from the dropdown menu in the top right corner.

## Testing the API

### Authentication Flow

1. Start with the "Health Check" request to ensure the API is running.
2. Register a new user using the "Register User" request.
3. Log in with the new user using the "Login User" request.
4. When you receive a response, copy the `accessToken` value from the response and set it in your environment variables.
5. Now you can use endpoints that require authentication.

### Testing Products

1. Use the "Get All Products" request to retrieve all products.
2. From the response, copy a product ID and set it as the `productId` environment variable.
3. Similarly, copy a product slug and set it as the `productSlug` environment variable.
4. Now you can test the "Get Product by ID" and "Get Product by Slug" requests.

### Testing Reviews

Once you have a valid `productId` and are authenticated:

1. Use the "Add Review" request to add a review for a product.
2. Then use the "Get Product Reviews" request to see reviews for that product.

### Testing Cart Operations

Ensure you're authenticated:

1. Use "Add to Cart" to add a product to your cart.
2. Use "Get Cart" to view your cart.
3. Use "Update Cart Item" to modify quantity or size.
4. Use "Remove from Cart" to remove an item.
5. Finally, use "Clear Cart" to empty your cart.

## Error Testing

You can test error handling using the "Error Demo Routes" folder:

1. "Test Bad Request Error" - Tests 400 error handling
2. "Test Not Found Error" - Tests 404 error handling
3. "Test Server Error" - Tests 500 error handling

## Environment Variables

The collection uses these key variables:

- `accessToken`: The JWT access token received after logging in
- `productId`: ID of a product to use in requests
- `productSlug`: Slug of a product to use in requests
- `verificationToken`: Token for email verification (obtained from email or DB)

Update these variables as you interact with the API for seamless testing.

## API Base URL

The collection uses `http://localhost:4000` as the base URL. If your API is running on a different URL, you'll need to update all request URLs.
