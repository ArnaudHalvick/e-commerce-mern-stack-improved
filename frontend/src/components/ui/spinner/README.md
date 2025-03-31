# Spinner Component

A flexible and reusable spinner component for loading states in the e-commerce application.

## Components

The spinner directory contains several components for different loading scenarios:

1. **Spinner** - The base spinner component
2. **InlineSpinner** - A compact spinner for inline use (buttons, form fields)
3. **LoadingContainer** - A centered spinner with optional message in a container
4. **FullPageLoader** - A full-page overlay with spinner for blocking operations

## Usage

### Basic Spinner

```jsx
import { Spinner } from '../components/ui/spinner';

// Default usage
<Spinner />

// With custom message
<Spinner message="Loading products..." />

// With custom size (small, medium, large)
<Spinner size="large" />

// Without message
<Spinner showMessage={false} />

// With additional className
<Spinner className="custom-spinner" />
```

### Inline Spinner

Useful for buttons or inline elements:

```jsx
import { InlineSpinner } from "../components/ui/spinner";

<button disabled={isLoading}>
  Save Changes
  {isLoading && <InlineSpinner />}
</button>;
```

### Loading Container

For sections of content that are loading:

```jsx
import { LoadingContainer } from "../components/ui/spinner";

{
  isLoading ? (
    <LoadingContainer message="Loading product details..." />
  ) : (
    <ProductDetails product={product} />
  );
}
```

### Full Page Loader

For operations that block the entire UI:

```jsx
import { FullPageLoader } from "../components/ui/spinner";

{
  isProcessingPayment && <FullPageLoader message="Processing payment..." />;
}
```

## Props

### Spinner Component

| Prop          | Type    | Default      | Description                                  |
| ------------- | ------- | ------------ | -------------------------------------------- |
| message       | string  | "Loading..." | Message to display during loading            |
| size          | string  | "medium"     | Size of spinner ("small", "medium", "large") |
| showAnimation | boolean | true         | Whether to show the spinner animation        |
| showMessage   | boolean | true         | Whether to show the message                  |
| className     | string  | ""           | Additional CSS class names                   |

### InlineSpinner Component

| Prop        | Type    | Default      | Description                                  |
| ----------- | ------- | ------------ | -------------------------------------------- |
| size        | string  | "small"      | Size of spinner ("small", "medium", "large") |
| showMessage | boolean | false        | Whether to show a message                    |
| message     | string  | "Loading..." | The loading message                          |

### LoadingContainer Component

| Prop      | Type   | Default      | Description                                  |
| --------- | ------ | ------------ | -------------------------------------------- |
| message   | string | "Loading..." | The loading message                          |
| size      | string | "medium"     | Size of spinner ("small", "medium", "large") |
| className | string | ""           | Additional CSS class for the container       |

### FullPageLoader Component

| Prop    | Type   | Default      | Description                                  |
| ------- | ------ | ------------ | -------------------------------------------- |
| message | string | "Loading..." | The loading message                          |
| size    | string | "large"      | Size of spinner ("small", "medium", "large") |

## Styling

The spinner components use two CSS files:

- `Spinner.css` - Styles for the base spinner component
- `SpinnerUtils.css` - Styles for utility components (InlineSpinner, LoadingContainer, FullPageLoader)

You can customize the appearance by modifying these files or by providing additional class names.
