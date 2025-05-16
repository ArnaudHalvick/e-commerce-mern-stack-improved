# UI Components

## Overview

This directory contains reusable UI components that form the design system for the admin dashboard. These components provide a consistent look and feel across the application while abstracting common functionality into reusable units.

## Directory Structure

```
ui/
├── badge/
│   └── Badge.jsx - Component for displaying status badges
├── button/
│   └── Button.jsx - Standardized button component
├── card/
│   └── Card.jsx - Container card component
├── input/
│   └── Input.jsx - Form input component
├── modal/
│   └── Modal.jsx - Dialog window component
├── notFound/
│   └── NotFound.jsx - 404 page component
├── select/
│   └── Select.jsx - Dropdown selection component
├── spinner/
│   └── Spinner.jsx - Loading indicator component
├── table/
│   └── Table.jsx - Data table component
└── index.js - Export file for components
```

## Components

### Button

A versatile button component that supports different sizes, variants, and states:

```jsx
import { Button } from "../components/ui";

// Primary button
<Button variant="primary" onClick={handleClick}>Submit</Button>

// Secondary button with loading state
<Button variant="secondary" loading>Processing</Button>

// Icon button
<Button icon="edit" variant="icon" size="small" onClick={handleEdit} />
```

### Input

A customizable form input component:

```jsx
import { Input } from "../components/ui";

// Text input with label
<Input
  label="Username"
  name="username"
  value={username}
  onChange={handleChange}
  placeholder="Enter your username"
/>

// Password input with error message
<Input
  type="password"
  label="Password"
  name="password"
  value={password}
  onChange={handleChange}
  error="Password must be at least 8 characters"
/>
```

### Select

A dropdown selection component:

```jsx
import { Select } from "../components/ui";

// Basic select with options
<Select
  label="Category"
  name="category"
  value={category}
  onChange={handleChange}
  options={[
    { value: "clothing", label: "Clothing" },
    { value: "electronics", label: "Electronics" },
  ]}
/>;
```

### Card

A container component for content grouping:

```jsx
import { Card } from "../components/ui";

// Simple card
<Card title="Sales Overview">
  <p>Content goes here</p>
</Card>

// Card with actions
<Card
  title="Product Statistics"
  actions={<Button variant="icon" icon="refresh" onClick={refreshData} />}
>
  <p>Content goes here</p>
</Card>
```

### Table

A data table component for displaying structured data:

```jsx
import { Table } from "../components/ui";

// Basic table
<Table
  columns={[
    { id: "name", header: "Name" },
    { id: "price", header: "Price" },
    { id: "status", header: "Status" },
  ]}
  data={products}
/>

// Table with custom cell rendering
<Table
  columns={[
    { id: "name", header: "Name" },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={row.status}>{row.status}</Badge>
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <Button size="small" onClick={() => handleEdit(row.id)}>Edit</Button>
      )
    },
  ]}
  data={products}
/>
```

### Badge

A component for displaying status indicators:

```jsx
import { Badge } from "../components/ui";

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

### Modal

A dialog component for overlaid content:

```jsx
import { Modal } from "../components/ui";

// Basic modal
<Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <div className="modal-actions">
    <Button variant="secondary" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Modal>;
```

### Spinner

A loading indicator component:

```jsx
import { Spinner } from "../components/ui";

// Default spinner
<Spinner />

// Large full-page spinner
<Spinner size="large" fullPage />
```

### NotFound

A 404 page component:

```jsx
import { NotFound } from "../components/ui";

// Basic 404 page
<NotFound />

// Custom 404 page
<NotFound
  title="Product Not Found"
  message="The product you're looking for doesn't exist or has been removed."
  actionText="Return to Products"
  actionLink="/products"
/>
```

## Design Principles

These UI components follow these design principles:

1. **Consistency**: Maintaining consistent styling, behavior, and API across components
2. **Accessibility**: Ensuring all components are accessible with proper ARIA attributes
3. **Flexibility**: Providing customization options while maintaining a cohesive design
4. **Reusability**: Creating components that can be reused across different contexts
5. **Responsiveness**: Ensuring components work well across different screen sizes

## Usage Guidelines

- Import components from the ui folder using the index export
- Use consistent props and patterns across the application
- Extend the existing components rather than creating new variants
- Follow the established design system for colors, spacing, and typography
