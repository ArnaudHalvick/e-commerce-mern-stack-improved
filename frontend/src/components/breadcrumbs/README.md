# Breadcrumb Navigation Component

This directory contains a reusable breadcrumb navigation component for displaying the user's current location within the application.

## Components

### `Breadcrumb`

A flexible breadcrumb component that shows the hierarchical navigation path.

#### Features

- Visual indication of the current page in the navigation hierarchy
- Clickable links for navigation to parent/ancestor pages
- Automatic styling for the current (active) page
- Consistent styling across the application
- Support for both legacy and modern prop formats

#### Usage

```jsx
import Breadcrumb from '../components/breadcrumbs/Breadcrumb';

// Basic usage
<Breadcrumb
  routes={[
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Product Name' } // Current page (no path needed)
  ]}
/>

// With explicit current page marker
<Breadcrumb
  routes={[
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Category', path: '/shop/category' },
    { label: 'Product Name', isCurrent: true }
  ]}
/>
```

#### Props

- `routes`: Array of route objects with:
  - `label` (string): Display text for the breadcrumb
  - `path` (string, optional): URL path for navigation (not required for current page)
  - `isCurrent` (boolean, optional): Whether this is the current page
- `links`: Legacy prop name for routes (for backward compatibility)

## Styling

The component includes its own CSS stylesheet (`Breadcrumb.css`) with:

- Responsive design for all screen sizes
- Hover effects for interactive elements
- Visual separation between breadcrumb items
- Distinct styling for the current page
- Custom arrow icon between navigation levels

## Implementation Notes

- Last item in the routes array is automatically treated as the current page if `isCurrent` is not specified
- If no routes are provided, a default "Home" breadcrumb is displayed
- Component automatically inserts arrow icons between breadcrumb items
