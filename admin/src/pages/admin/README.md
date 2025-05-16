# Admin Component

## Overview

The Admin component serves as the main container for the admin dashboard routing. It acts as a router component that renders different sections of the admin panel based on the current route.

## Directory Structure

```
admin/
├── Admin.jsx - Main component with routes configuration
├── Admin.css - Component styling
└── README.md - This documentation
```

## Features

- **Routes Management**: Defines and manages the routes for the admin dashboard
- **Dashboard Overview**: Displays key statistics and recent orders when on the main dashboard
- **Sub-Page Integration**: Integrates various admin pages (AddProduct, ListProduct, etc.)
- **Fallback Routes**: Handles invalid routes with fallback to the main dashboard

## Usage

The Admin component is typically used as the entry point after authentication:

```jsx
import Admin from "./pages/admin/Admin";
import { ProtectedRoute } from "./components/authGuard";

// In the main app router
<Route
  path="/*"
  element={
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  }
/>;
```

## Component Structure

### Admin Component

The main component that sets up the routing for admin pages:

- Uses React Router's `Routes` and `Route` components to define the admin routes
- Renders appropriate components based on the current route

### Dashboard Component

A nested component that displays the main dashboard:

- Shows key metrics in a stats grid (Total Products, Total Orders, Revenue, Returns)
- Displays recent orders in a table format
- Provides a quick overview of shop performance

## Route Configuration

The Admin component defines these routes:

- `/` - Main dashboard with statistics and recent orders
- `/add-product` - Interface for adding new products
- `/list-product` - Interface for managing existing products
- `*` - Fallback route that redirects to the dashboard

## Styling

The admin panel uses a dedicated CSS file with:

- Grid layout for the dashboard statistics
- Table styling for the recent orders
- Card components for grouping related information
- Responsive design considerations

## Integration

The Admin component integrates with:

1. **AddProduct**: For product creation functionality
2. **ListProduct**: For product management functionality
3. **AuthGuard**: For route protection (via parent routes)
4. **UI Components**: For consistent styling and interface elements

## Future Expansion

The Admin component is designed to be easily expanded with additional routes for:

- Order management
- Customer management
- Analytics and reporting
- Settings and configuration
