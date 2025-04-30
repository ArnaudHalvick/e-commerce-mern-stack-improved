# Backend Services

The `services` directory contains modules that implement the core business logic of the application. These services are responsible for executing the operations requested by controllers, encapsulating business rules, and interacting with data models. By separating business logic from controllers, we achieve better modularity, testability, and code organization.

## Service Pattern

This application follows a structured service pattern:

1. **Controllers** handle HTTP requests and delegate business logic to services
2. **Services** implement business logic and domain rules
3. **Models** define data structures and database interactions

Services return standardized result objects with the following structure:

```javascript
// Success case
{
  success: true,
  user: {...}, // or other relevant data
}

// Error case
{
  success: false,
  error: AppError instance
}
```

## Available Services

### `authService.js`

Manages all authentication-related operations.

#### Functions:

- `sendTokens(user, statusCode, res, additionalData)`: Generates and sends JWT tokens to the client
- `extractAndVerifyToken(req)`: Validates access tokens from request headers
- `extractAndVerifyRefreshToken(req)`: Validates refresh tokens from cookies
- `sendVerificationEmail(user)`: Sends email verification links
- `sendPasswordResetEmail(user)`: Sends password reset links
- `sendPasswordChangeNotification(user)`: Sends notifications when passwords are changed
- `handleFailedLogin(user)`: Manages failed login attempts and account locking
- `resetLoginAttempts(user)`: Resets failed login counters after successful login

### `profileService.js`

Manages user profile operations.

#### Functions:

- `getUserById(userId)`: Retrieves a user's profile information
- `updateUserProfile(userId, userData)`: Updates user profile details
- `changeUserPassword(userId, {currentPassword, newPassword})`: Changes a user's password
- `disableUserAccount(userId, {password})`: Disables a user account

## Error Handling

Services utilize the `AppError` class for consistent error handling. Each service function:

1. Validates input parameters
2. Performs the requested operation
3. Returns a standardized result object
4. Logs important events using the logger utility

## Usage Example

**In controllers**:

```javascript
// Example from authController.js
const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find user by email
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ normalizedEmail }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Use service to handle failed login attempt
    const failedLoginResult = await handleFailedLogin(user);
    return next(failedLoginResult.error);
  }

  // Use service to reset login attempts on successful login
  await resetLoginAttempts(user);

  // Use service to send response with tokens
  sendTokens(user, 200, res);
});
```

## Best Practices

When extending or modifying services:

1. Always return objects with `success` flag and appropriate data/error
2. Use detailed logging for all operations
3. Validate all inputs at the beginning of the function
4. Handle all edge cases and exceptions
5. Keep functions focused on a single responsibility
6. Maintain consistent error handling with `AppError`
7. Document all functions with JSDoc comments

## Related Components

- **Controllers**: Use services to implement API endpoints (`/controllers`)
- **Middleware**: Validate and prepare requests before reaching controllers (`/middleware`)
- **Models**: Define data schemas used by services (`/models`)
- **Utils**: Provide helper functions used by services (`/utils`)
