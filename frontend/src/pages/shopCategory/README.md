# Shop Category Page Components

This directory contains the components and logic for the category listing page.

## Structure

```
shopCategory/
├── components/           # UI components used in the ShopCategory page
│   ├── CategoryHeader.jsx    # Component for header and breadcrumbs
│   └── FilterBar.jsx         # Component for product filtering UI
├── hooks/                # Custom hooks for ShopCategory functionality
│   └── useCategoryProducts.jsx  # Hook for fetching products by category
└── index.jsx             # Main ShopCategory page component that composes everything
```

## Components

### CategoryHeader

Displays the category banner and breadcrumb navigation.

### FilterBar

Shows the product count and sorting options.

## Hooks

### useCategoryProducts

Custom hook that handles fetching products filtered by category from the API.
