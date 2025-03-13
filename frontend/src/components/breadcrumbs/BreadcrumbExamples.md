# Breadcrumb Component Usage Examples

The Breadcrumb component has been refactored to be more reusable and flexible. Here are examples of how to use it across different pages:

## Basic Usage

```jsx
import Breadcrumb from "../components/breadcrumbs/breadcrumb";

// Simple breadcrumb with just HOME and current page
<Breadcrumb
  routes={[{ label: "HOME", path: "/" }, { label: "CURRENT PAGE" }]}
/>;
```

## Product Page Example

```jsx
import Breadcrumb from "../components/breadcrumbs/breadcrumb";

// Product page breadcrumb with category and product name
<Breadcrumb
  routes={[
    { label: "HOME", path: "/" },
    { label: "SHOP", path: "/" },
    { label: product.category, path: `/${product.category.toLowerCase()}` },
    { label: product.name },
  ]}
/>;
```

## Category Page Example

```jsx
import Breadcrumb from "../components/breadcrumbs/breadcrumb";

// Category page breadcrumb
<Breadcrumb
  routes={[
    { label: "HOME", path: "/" },
    { label: "SHOP", path: "/" },
    { label: category },
  ]}
/>;
```

## Cart Page Example

```jsx
import Breadcrumb from "../components/breadcrumbs/breadcrumb";

// Cart page breadcrumb
<Breadcrumb
  routes={[
    { label: "HOME", path: "/" },
    { label: "SHOP", path: "/" },
    { label: "CART" },
  ]}
/>;
```

## Auth Page Example

```jsx
import Breadcrumb from "../components/breadcrumbs/breadcrumb";

// Auth page breadcrumb
<Breadcrumb
  routes={[
    { label: "HOME", path: "/" },
    { label: state }, // state could be "Login" or "Signup"
  ]}
/>;
```

## Props

The Breadcrumb component accepts the following props:

- `routes` (Array): An array of route objects with the following properties:
  - `label` (String): Display label for the route
  - `path` (String, optional for last item): URL path for the route
  - `isCurrent` (Boolean, optional): Whether this is the current page (applied to last item by default)

## Notes

- The last item in the routes array will automatically be styled as the current page
- You can override which item is styled as current by setting `isCurrent: true` on any route
- If no routes are provided, only HOME will be shown
