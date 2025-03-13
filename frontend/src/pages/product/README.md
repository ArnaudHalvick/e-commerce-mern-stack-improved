# Product Page Components

This directory contains the components and logic for the product detail page.

## Structure

```
product/
├── components/           # UI components used in the Product page
│   └── ProductPageStatus.jsx  # Component for displaying loading/error states
├── hooks/                # Custom hooks for Product functionality
│   └── useProductData.jsx     # Hook for fetching product data
└── index.jsx             # Main Product page component that composes everything
```

## Components

### ProductPageStatus

Handles displaying loading and error states for the product page.

## Hooks

### useProductData

Custom hook that handles fetching product data by ID or slug, with fallbacks to context data.
