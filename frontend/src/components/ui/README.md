# UI Components

This directory contains reusable UI components used throughout the application. These components are designed to be flexible, accessible, and consistent with the application's design system.

## Components

### FormInput

A versatile form input component that supports various input types including text, email, password, tel, and select.

#### Props

- `type` (string, required): Input type ('text', 'email', 'password', 'tel', 'select')
- `name` (string, required): Input field name
- `value` (string): Input value
- `onChange` (function, required): Change handler function
- `label` (string): Label text
- `error` (string | object): Error message or error object
- `required` (boolean): Whether the field is required
- `disabled` (boolean): Whether the field is disabled
- `placeholder` (string): Placeholder text
- `className` (string): Additional CSS classes
- `containerClassName` (string): CSS class for the container
- `labelClassName` (string): CSS class for the label
- `options` (array): Array of options for select type (format: `[{value: string, label: string}]`)
- `autoComplete` (string): HTML autocomplete attribute
- `onBlur` (function): Blur event handler

#### Example

```jsx
<FormInput
  type="text"
  name="username"
  value={username}
  onChange={handleChange}
  label="Username"
  required={true}
  error={errors.username}
  placeholder="Enter your username"
/>
```

### FormSubmitButton

A button component designed for form submissions with loading state support.

#### Props

- `text` (string, required): Button text
- `loadingText` (string): Text to show while loading
- `isLoading` (boolean): Loading state
- `disabled` (boolean): Whether the button is disabled
- `type` (string): Button type ('submit', 'button')
- `variant` (string): Button style variant ('primary', 'secondary', 'danger')
- `size` (string): Button size ('small', 'medium', 'large')
- `onClick` (function): Click handler
- `className` (string): Additional CSS classes
- `aria-label` (string): Accessibility label

#### Example

```jsx
<FormSubmitButton
  text="Save Changes"
  loadingText="Saving..."
  isLoading={isSubmitting}
  disabled={!isValid}
  variant="primary"
  size="medium"
/>
```

### Modal

A reusable modal component for displaying content in an overlay.

#### Props

- `isOpen` (boolean, required): Controls modal visibility
- `onClose` (function, required): Close handler function
- `title` (string): Modal title
- `children` (node): Modal content
- `className` (string): Additional CSS classes
- `closeOnOverlayClick` (boolean): Whether clicking overlay closes modal
- `closeOnEscape` (boolean): Whether pressing Escape closes modal

#### Example

```jsx
<Modal
  isOpen={isModalOpen}
  onClose={handleClose}
  title="Confirm Action"
  closeOnOverlayClick={true}
>
  <div>Modal content goes here</div>
</Modal>
```

### Spinner

A loading spinner component with customizable size and message.

#### Props

- `size` (string): Spinner size ('small', 'medium', 'large')
- `message` (string): Loading message
- `className` (string): Additional CSS classes

#### Example

```jsx
<Spinner message="Loading data..." size="medium" className="custom-spinner" />
```

## Usage Guidelines

1. Always provide meaningful `aria-label` attributes for better accessibility
2. Use consistent variants and sizes across the application
3. Handle loading and error states appropriately
4. Maintain consistent spacing using the provided className props
5. Follow the established design system for colors and typography

## Best Practices

1. Use FormInput for all form inputs to maintain consistency
2. Implement proper form validation and error handling
3. Show loading states during async operations
4. Make all interactive elements keyboard accessible
5. Provide clear feedback for user actions
6. Use semantic HTML elements within components
7. Follow WCAG accessibility guidelines

## Styling

Components use CSS modules for styling to prevent conflicts. Custom styles can be applied using the `className` prop on each component.

## Contributing

When adding new UI components:

1. Follow the existing component structure
2. Include proper TypeScript types/PropTypes
3. Add comprehensive documentation
4. Include usage examples
5. Ensure accessibility compliance
6. Add proper error handling
7. Test across different browsers
