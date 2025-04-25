# Filter Sidebar Component

This directory contains components for filtering products in the shop and product listing pages.

## Structure

```
filterSidebar/
├── components/               # Filter sub-components
│   ├── CategoryFilter.jsx    # Filter by product category
│   ├── DiscountFilter.jsx    # Filter by discount percentage
│   ├── FilterHeader.jsx      # Sidebar header with clear button
│   ├── PriceFilter.jsx       # Filter by price range
│   ├── RatingFilter.jsx      # Filter by product rating
│   ├── TagsFilter.jsx        # Filter by product tags
│   ├── TypesFilter.jsx       # Filter by product types
│   └── index.js              # Component exports
├── hooks/                    # Custom hooks for filter functionality
│   ├── useFilterHandlers.js  # Hook for filter change handlers
│   └── index.js              # Hook exports
├── styles/                   # CSS styles for filter components
│   └── index.css             # Main filter sidebar styles
├── utils/                    # Utility functions
│   └── areEqual.js           # Optimization for React.memo
└── index.jsx                 # Main FilterSidebar component
```

## Components

### Main Component

#### `FilterSidebar`

Sidebar for filtering products with multiple filter criteria.

Features:

- Memoized component to prevent unnecessary re-renders
- Modular filter components
- Responsive design for mobile and desktop
- Support for URL-based filtering
- Clear all filters functionality

### Filter Components

#### `CategoryFilter`

Filter products by category with checkbox options.

#### `PriceFilter`

Filter products by price range with min/max inputs.

#### `DiscountFilter`

Filter products by discount percentage.

#### `RatingFilter`

Filter products by star rating.

#### `TagsFilter`

Filter products by available tags.

#### `TypesFilter`

Filter products by product types.

#### `FilterHeader`

Header component with title and clear filters button.

## Hooks

### `useFilterHandlers`

Custom hook for managing filter change handlers and state:

- Handles filter selection and deselection
- Provides clear filters functionality
- Implements debouncing for input filters

## Usage

```jsx
import FilterSidebar from "../components/filterSidebar";

// In your product listing page
const ProductListingPage = () => {
  const [filters, setFilters] = useState({
    category: [],
    priceRange: { min: 0, max: 1000 },
    discount: false,
    rating: 0,
    tags: [],
    types: [],
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      priceRange: { min: 0, max: 1000 },
      discount: false,
      rating: 0,
      tags: [],
      types: [],
    });
  };

  return (
    <div className="product-listing">
      <div className="sidebar-container">
        <FilterSidebar
          filters={filters}
          availableTags={availableTags}
          availableTypes={availableTypes}
          handleFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
        />
      </div>
      <div className="product-grid">{/* Products display */}</div>
    </div>
  );
};
```

## Performance Optimization

The `FilterSidebar` component uses React.memo with a custom comparison function (`areEqual`) to prevent unnecessary re-renders when filter props haven't changed meaningfully.
