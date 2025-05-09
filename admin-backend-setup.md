# Admin Backend Setup

## Changes Made

1. Created isAdmin middleware in auth.js for admin-only routes
2. Added isAdmin field to User model
3. Created separate adminAuthController.js for admin authentication
4. Created dedicated adminAuthRoutes.js for admin login and token management
5. Updated adminRoutes.js to use isAdmin middleware
6. Updated server.js to use new admin routes
7. Created admin user creation script
8. Updated admin frontend environment config

## URLs for Testing

### Admin Login (Postman)
POST https://mernappshopper.xyz/api/admin/auth/login
Content-Type: application/json

```json
{
  "email": "admin@mernappshopper.xyz",
  "password": "Admin@123456"
}
```

### Verify Admin Token
GET https://mernappshopper.xyz/api/admin/auth/verify
auth-token: YOUR_TOKEN_HERE

### Refresh Admin Token
POST https://mernappshopper.xyz/api/admin/auth/refresh-token

## Setup Instructions

1. Run the admin user creation script:
   `node backend/scripts/createAdminUser.js`

2. Update both frontend projects to use the correct API URLs

3. Test admin login endpoints using Postman

