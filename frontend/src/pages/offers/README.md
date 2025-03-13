# Offers Page Components

This directory contains the components and logic for the offers/deals page.

## Structure

```
offers/
├── components/           # UI components used in the Offers page
│   ├── FilterSidebar.jsx     # Component for filtering products
│   ├── OffersHeader.jsx      # Component for page header
│   ├── OffersBreadcrumb.jsx  # Component for breadcrumb navigation
│   └── ProductsContent.jsx   # Component for product grid and pagination
├── hooks/                # Custom hooks for Offers functionality
│   └── useOffersData.jsx     # Hook for fetching and filtering products
└── index.jsx             # Main Offers page component that composes everything
```

## Components

### FilterSidebar

Sidebar component that contains all filtering options for products.

### OffersHeader

Displays the page header for the offers section.

### OffersBreadcrumb

Provides breadcrumb navigation for the offers page.

### ProductsContent

Displays the product grid, sorting options, and pagination controls.

## Hooks

### useOffersData

Custom hook that handles fetching products, applying filters, and sorting options.
