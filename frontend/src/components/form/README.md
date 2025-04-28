# Form Components

A collection of reusable form components for building consistent and accessible forms throughout the application.

## Components

### FormInputField

A highly customizable and accessible input field component that supports:

- Multiple input types (text, email, password, select)
- Validation with error messaging
- Nested field support (e.g., "address.street")
- Accessibility features
- Custom styling

#### Usage

```jsx
import { FormInputField } from "../components/form";

const MyForm = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <FormInputField
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      label="Email Address"
      placeholder="Enter your email"
      error={errors.email}
      required
    />
  );
};
```

### FormSubmitButton

A customizable button component specifically designed for form submissions with:

- Loading state indication
- Customizable text and loading text
- Multiple size and variant options
- Accessibility features

#### Usage

```jsx
import { FormSubmitButton } from "../components/form";

const MyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit form data
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <FormSubmitButton
        text="Sign Up"
        loadingText="Creating Account..."
        isLoading={isSubmitting}
        variant="primary"
        size="medium"
      />
    </form>
  );
};
```

## Best Practices

1. Always provide descriptive labels for form fields
2. Handle and display validation errors appropriately
3. Ensure forms remain accessible by leveraging the built-in accessibility features
4. Use consistent styling through the provided variant and size props
