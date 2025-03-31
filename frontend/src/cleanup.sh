#!/bin/bash

# Cleanup script for removing old API-related files

echo "Cleaning up old API-related files..."

# Remove old services files
echo "Removing old services files..."
rm -f src/services/apiClient.js
rm -f src/services/api.js
rm -f src/services/authApi.js
rm -f src/services/authService.js
rm -f src/services/cartApi.js
rm -f src/services/productsApi.js
rm -f src/services/reviewsApi.js
rm -f src/services/paymentService.js
rm -f src/services/index.js

# Remove old utils API files
echo "Removing old utils API files..."
rm -f src/utils/axiosConfig.js
rm -f src/utils/apiUtils.js
rm -f src/utils/apiErrorUtils.js

echo "Cleanup complete!" 