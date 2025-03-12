const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load mock users data
const mockUsersPath = path.join(__dirname, "mock-users.json");
const mockUsers = JSON.parse(fs.readFileSync(mockUsersPath, "utf8"));

// API endpoint for user registration
const API_URL = "http://localhost:4000/api/signup";

// Function to create a user
async function createUser(userData) {
  try {
    // Format the data according to the API requirements
    const user = {
      username: userData.name,
      email: userData.email,
      password: userData.password,
    };

    // Make API request to create user
    const response = await axios.post(API_URL, user);
    console.log(`User created: ${userData.name} (${userData.email})`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(
        `Failed to create user ${userData.email}: ${error.response.data.message}`
      );
    } else {
      console.error(
        `Failed to create user ${userData.email}: ${error.message}`
      );
    }
    return null;
  }
}

// Function to import all users with delay between requests
async function importUsers() {
  console.log(`Starting import of ${mockUsers.length} users...`);

  // Import users with a delay between each request to avoid overwhelming the server
  for (let i = 0; i < mockUsers.length; i++) {
    const userData = mockUsers[i];

    // Skip users with passwords shorter than 8 characters (as required by the model)
    if (userData.password.length < 8) {
      console.log(`Skipping user ${userData.email}: Password too short`);
      continue;
    }

    await createUser(userData);

    // Add a small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Log progress
    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${mockUsers.length} users processed`);
    }
  }

  console.log("User import completed!");
}

// Run the import
importUsers().catch((error) => {
  console.error("Import failed:", error);
});
