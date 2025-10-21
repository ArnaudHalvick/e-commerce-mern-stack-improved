# Testing the Error Handling System

This document provides guidance on how to test the error handling system of our Express backend application. It covers manual testing methods, automated testing techniques, and common error scenarios to verify.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Testing](#manual-testing)
3. [Automated Testing](#automated-testing)
4. [Common Error Scenarios](#common-error-scenarios)
5. [Checking Log Files](#checking-log-files)
6. [Verifying Different Environments](#verifying-different-environments)

## Prerequisites

Before testing, ensure:

1. You have the backend running locally
2. An API testing tool is available (Postman, Insomnia, or curl)
3. Access to log files in the `/logs` directory
4. The ability to switch between development and production environments

## Manual Testing

### Setting Up Environment Variables

Test both environments:

```bash
# Development mode
npm run dev

# Production mode
npm run prod
```

### Basic Error Testing with API Calls

#### 1. Testing 404 Not Found

Make a request to a non-existent endpoint:

```bash
curl -X GET http://localhost:4000/api/nonexistent-endpoint
```

Expected response:

- Development: Detailed error with stack trace
- Production: Simple error message without implementation details

#### 2. Testing Validation Errors

Make a request with invalid data:

```bash
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "short"}'
```

Expected response:

- Specific validation error messages
- 400 status code

#### 3. Testing Authentication Errors

Make a request to a protected endpoint without authentication:

```bash
curl -X GET http://localhost:4000/api/me
```

Expected response:

- Authentication error message
- 401 status code

#### 4. Testing Database Errors

Test database related errors (e.g., duplicate key, validation):

```bash
# Example: Create a user with an existing email
curl -X POST http://localhost:4000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com", "password": "password123", "username": "existinguser"}'
```

## Automated Testing

### Creating Test Suites with Jest/Supertest

Basic structure for error handling tests:

```javascript
const request = require("supertest");
const app = require("../app");

describe("Error Handling", () => {
  // Test 404 errors
  test("should handle 404 errors", async () => {
    const response = await request(app).get("/nonexistent-endpoint");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("status", "fail");
    expect(response.body).toHaveProperty("message");
  });

  // Test validation errors
  test("should handle validation errors", async () => {
    const response = await request(app)
      .post("/api/signup")
      .send({ email: "invalid", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("status", "fail");
  });

  // Test authentication errors
  test("should handle authentication errors", async () => {
    const response = await request(app).get("/api/me");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("status", "fail");
  });
});
```

### Testing Async Error Handling

```javascript
test("should handle async errors", async () => {
  // Mock the User.findById to throw an error
  jest.spyOn(User, "findById").mockImplementationOnce(() => {
    throw new Error("Database connection lost");
  });

  const response = await request(app)
    .get("/api/users/123")
    .set("Authorization", `Bearer ${validToken}`);

  expect(response.status).toBe(500);
  expect(response.body).toHaveProperty("status", "error");
});
```

## Common Error Scenarios

Test these specific scenarios to ensure comprehensive error handling:

### 1. Resource Not Found Errors

- Product not found
- User not found
- Cart not found
- Review not found

### 2. Validation Errors

- Invalid email format
- Password too short
- Required fields missing
- Malformed JSON in request body

### 3. Authentication & Authorization Errors

- Invalid login credentials
- Expired JWT token
- Insufficient permissions
- Missing authentication token

### 4. Database Errors

- Duplicate key (e.g., email already exists)
- Invalid MongoDB ObjectId format
- Schema validation failures
- Connection errors (may require mocking)

### 5. External Service Errors

- Email sending failures
- Third-party API timeouts
- Network errors

## Checking Log Files

After running tests, verify the logs contain the expected information:

### In Development Mode

Check the console output for:

- Detailed error messages
- Full stack traces
- Request information

### In Production Mode

Check the log files in the `/logs` directory:

- `error.log` should contain error-level logs
- `combined.log` should contain all logs

Look for:

- Structured JSON format
- Error classification
- Timestamps
- Sanitized stack traces

## Verifying Different Environments

### Development Environment Checklist

- ✅ Detailed error responses with stack traces
- ✅ All errors logged to console
- ✅ Request details logged with errors
- ✅ Database errors properly categorized

### Production Environment Checklist

- ✅ Sanitized error responses (no implementation details)
- ✅ Standard error format for client consumption
- ✅ Sensitive information removed from responses
- ✅ All errors logged to files
- ✅ Proper error categorization
