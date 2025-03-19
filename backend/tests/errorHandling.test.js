/**
 * Manual Error Handling Test Script
 *
 * This file contains a series of tests to manually verify the error handling system.
 * Run each test function separately to observe the error responses and logging.
 */

// Import dependencies
const axios = require("axios");
const mongoose = require("mongoose");

// Base URL for API requests
const API_URL = process.env.API_URL || "http://localhost:4000/api";

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null, token = null) => {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {},
    validateStatus: () => true, // Don't throw errors on non-2xx responses
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    // Log any network or axios errors
    console.error("Request error:", error.message);
    return { status: 0, data: { error: error.message } };
  }
};

// Test 1: 404 Not Found Error
const test404Error = async () => {
  console.log("\n=== Testing 404 Not Found Error ===");

  const response = await makeRequest("get", "/nonexistent-endpoint");

  console.log(`Status: ${response.status}`);
  console.log("Response:", JSON.stringify(response.data, null, 2));

  return response;
};

// Test 2: Validation Error
const testValidationError = async () => {
  console.log("\n=== Testing Validation Error ===");

  const invalidData = {
    email: "invalid-email",
    password: "short",
  };

  const response = await makeRequest("post", "/signup", invalidData);

  console.log(`Status: ${response.status}`);
  console.log("Response:", JSON.stringify(response.data, null, 2));

  return response;
};

// Test 3: Authentication Error
const testAuthError = async () => {
  console.log("\n=== Testing Authentication Error ===");

  const response = await makeRequest("get", "/me");

  console.log(`Status: ${response.status}`);
  console.log("Response:", JSON.stringify(response.data, null, 2));

  return response;
};

// Test 4: Database Error (Invalid MongoDB ID)
const testDatabaseError = async () => {
  console.log("\n=== Testing Database Error (Invalid MongoDB ID) ===");

  const response = await makeRequest("get", "/products/invalid-id");

  console.log(`Status: ${response.status}`);
  console.log("Response:", JSON.stringify(response.data, null, 2));

  return response;
};

// Test 5: Duplicate Entry Error
const testDuplicateError = async () => {
  console.log("\n=== Testing Duplicate Entry Error ===");

  // First, register a user
  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: "TestPassword123!",
  };

  const registerResponse = await makeRequest("post", "/signup", userData);
  console.log(`Register status: ${registerResponse.status}`);

  // Then try to register the same user again
  const duplicateResponse = await makeRequest("post", "/signup", userData);

  console.log(`Duplicate status: ${duplicateResponse.status}`);
  console.log("Response:", JSON.stringify(duplicateResponse.data, null, 2));

  return duplicateResponse;
};

// Run tests
const runTests = async () => {
  try {
    await test404Error();
    await testValidationError();
    await testAuthError();
    await testDatabaseError();
    await testDuplicateError();

    console.log("\n=== All tests completed ===");
  } catch (error) {
    console.error("Test execution error:", error);
  }
};

// Uncomment to run all tests
// runTests();

// Export individual tests for manual execution
module.exports = {
  test404Error,
  testValidationError,
  testAuthError,
  testDatabaseError,
  testDuplicateError,
  runTests,
};

/**
 * How to use this test script:
 *
 * 1. Make sure your backend server is running
 * 2. From the backend directory, run:
 *    node -e "require('./tests/errorHandling.test').runTests()"
 *
 * Or run individual tests:
 *    node -e "require('./tests/errorHandling.test').test404Error()"
 */
