# E-Commerce MERN Stack API - Postman Guide

This guide explains how to use the Postman collection to test the API endpoints of the E-Commerce MERN Stack backend.

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
     - `resetToken` (leave the value empty for now)
     - `reviewId` (leave the value empty for now)
     - `orderId` (leave the value empty for now)
     - `paymentIntentId` (leave the value empty for now)
     - `paymentMethodId` (leave the value empty for now)
   - Click "Save"

2. Select your environment from the dropdown menu in the top right corner.

## Testing the API

### Authentication Flow

1. Start with the "Health Check" request to ensure the API is running.
2. Register a new user using the "Register User" request.
3. Verify your email if required:
   - Send a verification request using "Request Email Verification"
   - Check your email (or database) for the verification token
   - Add the token to your environment variables as `verificationToken`
   - Use the "Verify Email with Token" request
4. Log in with the user using the "Login User" request.
5. When you receive a response, copy the `accessToken` value from the response JSON and set it in your environment variables.
6. Now you can use endpoints that require authentication.

### Authentication Maintenance

- The access token expires after a period of time (typically 15-30 minutes)
- When it expires, use the "Refresh Token" request to get a new token
- This works because a refresh token is stored in a cookie
- Ensure your Postman settings have "Automatically follow redirects" enabled and "Save cookies" enabled

### User Management

1. Once logged in, you can view your profile with "Get User Profile".
2. Update your profile with "Update Profile".
3. Change your password with "Change Password".
4. If you want to test password reset:
   - Use "Forgot Password" first
   - Check your email (or database) for the reset token
   - Add the token to your environment as `resetToken`
   - Use "Reset Password" to set a new password
5. Use "Logout User" when you're finished.

### Products

1. Use "Get All Products" to retrieve all products.
2. From the response, copy a product ID and set it as the `productId` environment variable.
3. Also copy a product slug and set it as the `productSlug` environment variable.
4. Now you can test "Get Product by ID" and "Get Product by Slug" requests.
5. Try filtering products with the category, type, and tag endpoints.
6. Use "Get Related Products" to find products similar to one you've selected.

### Cart Operations

Make sure you're authenticated first, then:

1. Use "Add to Cart" to add a product to your cart.
2. Use "Get Cart" to view your cart contents.
3. Use "Update Cart Item" to modify quantity or other attributes.
4. Use "Remove from Cart" to remove an item.
5. Use "Clear Cart" to empty your cart.

### Reviews

Once you have a valid `productId` and are authenticated:

1. Use "Add Review" to add a review for a product.
2. From the response, save the review ID to your `reviewId` environment variable.
3. Use "Get Product Reviews" to see all reviews for that product.
4. You can "Update Review" or "Delete Review" if needed.
5. Test marking a review as helpful with "Mark Review as Helpful".

### Checkout Process

To test the payment process:

1. Add items to your cart and ensure you're authenticated.
2. Get a summary of your cart with "Get Cart Summary".
3. Create a payment intent with "Create Payment Intent".
4. From the response, save the payment intent ID to your `paymentIntentId` environment variable.
5. In a real application, you would collect payment method details from the user.
   - For testing, you can use Stripe's test cards (e.g., 4242 4242 4242 4242).
   - Save the payment method ID to your `paymentMethodId` environment variable.
6. Confirm the order with "Confirm Order".
7. View your orders with "Get My Orders".
8. From the orders list, save an order ID to your `orderId` environment variable.
9. Get details of a specific order with "Get Order by ID".

### Error Testing

You can test error handling using the "Error Demo Routes" folder:

1. "Test Error" - Triggers a server error (500)
2. "Validation Error" - Triggers a validation error (400)
3. "Delayed Success" - Simulates a delayed response to test loading states

## Important Notes

### API Base URL

The collection uses `http://localhost:4000` as the base URL. If your API is running on a different URL, you'll need to update the requests:

1. You can create a "base_url" environment variable and update all requests
2. Or you can edit each request manually
3. Or use Postman's "Find and Replace" feature

### Authentication

- Most endpoints require authentication via the `Authorization: Bearer {{accessToken}}` header
- The token expires after a set time, so you may need to re-login or refresh the token
- Some endpoints require verified email status

### Rate Limiting

The API implements rate limiting on certain sensitive endpoints:

- Login
- Registration
- Password Reset

If you make too many requests in a short period, you'll receive a 429 (Too Many Requests) error.

### CORS Policy

The API has CORS protection. If you're testing from a different origin, ensure that origin is allowed in the server configuration.

## Troubleshooting

1. **Authentication issues:**

   - Check that your `accessToken` is set correctly
   - Ensure the token hasn't expired
   - Try logging in again to get a fresh token

2. **404 errors:**

   - Verify the endpoint path is correct
   - Check that the specified resource exists (e.g., correct product ID)

3. **Validation errors:**

   - Check the response body for details about what validation failed
   - Ensure all required fields are provided with proper values

4. **500 server errors:**
   - Check the server logs for details
   - This indicates a bug in the API implementation
