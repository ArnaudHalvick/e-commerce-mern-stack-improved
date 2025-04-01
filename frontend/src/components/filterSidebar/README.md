# FilterSidebar Component

A highly optimized React component for filtering products in an e-commerce application. This sidebar provides a comprehensive set of filtering options including category, price range, discount status, rating, tags, and product types.

![FilterSidebar Component Screenshot](component-screenshot.png) <!-- Consider adding a screenshot -->

## Features

- **Performance Optimized**: Uses React.memo with custom comparison to prevent unnecessary re-renders
- **Comprehensive Filters**:
  - Category selection (men, women, kids)
  - Price range with min/max inputs
  - Discount toggle for sales items
  - Star rating selector (1-5 stars)
  - Dynamic tag filtering
  - Product type selection
- **Clear All Functionality**: Easily reset all active filters
- **Fully Responsive**: Adapts to different screen sizes with optimized layouts
- **Accessibility**: Proper semantic structure with appropriate ARIA attributes
- **Customizable**: Optional category filter display

## Props

| Prop                 | Type     | Required | Default | Description                                                        |
| -------------------- | -------- | -------- | ------- | ------------------------------------------------------------------ |
| `filters`            | Object   | Yes      | -       | Current filter state containing all filter values                  |
| `availableTags`      | Array    | Yes      | -       | Array of available tags to display as options                      |
| `availableTypes`     | Array    | Yes      | -       | Array of available product types to display as options             |
| `handleFilterChange` | Function | Yes      | -       | Callback function for filter changes `(filterType, value) => void` |
| `clearAllFilters`    | Function | Yes      | -       | Callback function to reset all filters                             |
| `showCategoryFilter` | Boolean  | No       | `true`  | Controls visibility of the category filter section                 |

### Filters Object Structure

```javascript
{
  category: [], // Array of selected categories
  price: {
    min: 0, // Minimum price
    max: 1000 // Maximum price
  },
  discount: false, // Whether to show only discounted items
  rating: 0, // Selected minimum rating (0 means no filter)
  tags: [], // Array of selected tags
  types: [] // Array of selected product types
}
```

## Usage Example

```jsx
import React, { useState } from "react";
import FilterSidebar from "../components/filterSidebar/FilterSidebar";

const ProductPage = () => {
  // Initial filter state
  const [filters, setFilters] = useState({
    category: [],
    price: { min: 0, max: 1000 },
    discount: false,
    rating: 0,
    tags: [],
    types: [],
  });

  // Available filter options (typically from API)
  const availableTags = ["New Arrival", "Limited Edition", "Bestseller"];
  const availableTypes = ["T-Shirts", "Pants", "Shoes", "Accessories"];

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "category":
        setFilters((prev) => ({
          ...prev,
          category: prev.category.includes(value)
            ? prev.category.filter((item) => item !== value)
            : [...prev.category, value],
        }));
        break;
      case "price":
        setFilters((prev) => ({ ...prev, price: value }));
        break;
      case "discount":
        setFilters((prev) => ({ ...prev, discount: value }));
        break;
      case "rating":
        setFilters((prev) => ({ ...prev, rating: value }));
        break;
      case "tag":
        setFilters((prev) => ({
          ...prev,
          tags: prev.tags.includes(value)
            ? prev.tags.filter((item) => item !== value)
            : [...prev.tags, value],
        }));
        break;
      case "type":
        setFilters((prev) => ({
          ...prev,
          types: prev.types.includes(value)
            ? prev.types.filter((item) => item !== value)
            : [...prev.types, value],
        }));
        break;
      default:
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      category: [],
      price: { min: 0, max: 1000 },
      discount: false,
      rating: 0,
      tags: [],
      types: [],
    });
  };

  return (
    <div className="product-page">
      <FilterSidebar
        filters={filters}
        availableTags={availableTags}
        availableTypes={availableTypes}
        handleFilterChange={handleFilterChange}
        clearAllFilters={clearAllFilters}
        showCategoryFilter={true}
      />
      {/* Product grid/list would go here */}
    </div>
  );
};

export default ProductPage;
```

## Advanced Configuration

### Custom Category Options

The component uses predefined category options (`men`, `women`, `kids`). If you need to customize these categories, you'll need to modify the component's source code.

### Performance Optimization

The component uses React.memo with a custom comparison function to prevent unnecessary re-renders. This makes it highly efficient even with frequent filter changes or large sets of filter options.

## CSS Customization

The component includes a comprehensive CSS file with responsive breakpoints. The major customization points include:

- `.filtersidebar`: Main container styles
- `.filtersidebar-section`: Individual filter section
- `.filtersidebar-checkbox`: Checkbox styling for filter options
- `.filtersidebar-star-rating`: Star rating filter styles
- `.filtersidebar-price-inputs`: Price range input styles

## Browser Compatibility

- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- IE11: Not supported

## Dependencies

- React 16.8+ (Hooks support required)
- No external dependencies

## License

MIT
