# Breadcrumb Component

A reusable, responsive breadcrumb navigation component for the e-commerce application.

## Features

- Dynamic breadcrumb trail based on navigation path
- Clickable links for navigation to previous levels
- Highlighted current page
- Fully responsive design with mobile breakpoints
- Custom styling with hover effects
- Automatic fallback to home if no routes provided

## Props

| Prop     | Type  | Default                        | Description                                          |
| -------- | ----- | ------------------------------ | ---------------------------------------------------- |
| `routes` | Array | `[{label: "Home", path: "/"}]` | Array of route objects defining the breadcrumb trail |

### Route Object Properties

Each route in the `routes` array should be an object with these properties:

| Property    | Type    | Required                   | Description                                              |
| ----------- | ------- | -------------------------- | -------------------------------------------------------- |
| `label`     | string  | Yes                        | Display text for the breadcrumb item                     |
| `path`      | string  | Yes (except for last item) | URL path for navigation                                  |
| `isCurrent` | boolean | No                         | Whether this is the current page (defaults to last item) |

## Usage Examples

### Basic Usage

```jsx
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";

// Example for a product page
const ProductPageBreadcrumbs = () => {
  const routes = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Product Name" }, // Last item doesn't need a path
  ];

  return <Breadcrumb routes={routes} />;
};
```

### Dynamic Routes from URL

```jsx
import Breadcrumb from "../components/breadcrumbs/Breadcrumb";
import { useParams } from "react-router-dom";

const CategoryPage = () => {
  const { categoryId } = useParams();

  // This could also come from an API or state
  const categoryName = getCategoryName(categoryId);

  const routes = [
    { label: "Home", path: "/" },
    { label: "Categories", path: "/categories" },
    { label: categoryName },
  ];

  return (
    <>
      <Breadcrumb routes={routes} />
      {/* Rest of your page */}
    </>
  );
};
```

## Styling

The component includes its own CSS file (`Breadcrumb.css`) with:

- Basic layout and spacing
- Color scheme matching the application theme
- Hover effects for links
- Responsive design with media queries for different screen sizes

You can customize the appearance by modifying the CSS file.

## Dependencies

- React
- React Router DOM for the `Link` component
- Arrow icon from `../assets/breadcrum_arrow.png`
- CSS styles from `./Breadcrumb.css`
