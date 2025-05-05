# Components

A collection of reusable React components that make up the e-commerce application's user interface.

## Structure

```
components/
├── assets/              # Component-specific assets
├── authGuard/          # Authentication protection
├── breadcrumbs/        # Navigation breadcrumbs
├── cartItems/          # Shopping cart components
├── container/          # Layout containers
├── descriptionBox/     # Product descriptions
├── errorHandling/      # Error components and boundaries
├── filterSidebar/      # Product filtering
├── footer/             # Site footer
├── form/
│   ├── FormInputField/ # Form input components
│   └── FormSubmitButton/ # Form submit buttons
├── hero/               # Hero section components
├── item/               # Product item components
├── navbar/             # Navigation components
├── newCollections/     # New products section
├── newsLetter/         # Newsletter subscription
├── popular/            # Popular products section
├── productDisplay/     # Product display components
├── relatedProducts/    # Related products section
├── shop/               # Shop page components
└── ui/                 # Shared UI components
    ├── modal/          # Modal dialogs
    └── spinner/        # Loading indicators
```

## Core Components

### Product Components

#### ProductDisplay

Main product display component:

```jsx
import { ProductDisplay } from "../components/productDisplay";

const ProductPage = () => (
  <ProductDisplay
    product={product}
    onAddToCart={handleAddToCart}
    loading={loading}
  />
);
```

Features:

- Image gallery
- Product details
- Price display
- Size selection
- Add to cart
- Loading states

#### Item

Individual product item component:

```jsx
import { Item } from "../components/item";

const ProductGrid = () => (
  <div className="grid">
    {products.map((product) => (
      <Item key={product.id} product={product} onQuickView={handleQuickView} />
    ))}
  </div>
);
```

Features:

- Product image
- Quick view
- Price display
- Rating display
- Hover effects

### Navigation Components

#### Navbar

Main navigation component:

```jsx
import { Navbar } from "../components/navbar";

const Layout = () => (
  <Navbar user={user} cartCount={cartCount} onSearch={handleSearch} />
);
```

Features:

- Responsive design
- Search functionality
- Cart indicator
- User menu
- Category navigation

#### Breadcrumbs

Navigation breadcrumbs:

```jsx
import { Breadcrumbs } from "../components/breadcrumbs";

const ProductPage = () => (
  <Breadcrumbs
    items={[
      { label: "Home", path: "/" },
      { label: "Shop", path: "/shop" },
      { label: product.name },
    ]}
  />
);
```

### Form Components

#### FormInputField

Reusable form input component:

```jsx
import { FormInputField } from "../components/form/FormInputField";

const LoginForm = () => (
  <FormInputField
    name="email"
    label="Email"
    type="email"
    value={email}
    onChange={handleChange}
    error={errors.email}
  />
);
```

Features:

- Label integration
- Error display
- Validation states
- Accessibility
- Custom styling

#### FormSubmitButton

Form submit button component:

```jsx
import { FormSubmitButton } from "../components/form/FormSubmitButton";

const Form = () => (
  <FormSubmitButton loading={loading} disabled={!isValid} text="Submit" />
);
```

### UI Components

#### Modal

Reusable modal component:

```jsx
import { Modal } from "../components/ui/modal";

const QuickView = () => (
  <Modal isOpen={isOpen} onClose={handleClose} title="Quick View">
    <ProductQuickView product={product} />
  </Modal>
);
```

Features:

- Backdrop
- Close button
- Animation
- Accessibility
- Responsive

#### Spinner

Loading indicator component:

```jsx
import { Spinner } from "../components/ui/spinner";

const LoadingState = () => <Spinner size="medium" color="primary" />;
```

## Usage Guidelines

### Component Composition

```jsx
import { Container } from "../components/container";
import { ProductDisplay } from "../components/productDisplay";
import { RelatedProducts } from "../components/relatedProducts";

const ProductPage = () => (
  <Container>
    <ProductDisplay product={product} />
    <RelatedProducts productId={product.id} />
  </Container>
);
```

### Error Handling

```jsx
import { ErrorBoundary } from "../components/errorHandling/boundary";
import { ErrorMessage } from "../components/errorHandling/ErrorMessage";

const SafeComponent = () => (
  <ErrorBoundary fallback={<ErrorMessage />}>
    <ComponentThatMightError />
  </ErrorBoundary>
);
```

### Responsive Design

```jsx
import { useMediaQuery } from "../hooks";
import { Navbar, MobileNavbar } from "../components/navbar";

const Navigation = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return isMobile ? <MobileNavbar /> : <Navbar />;
};
```

## Development Guidelines

1. Component Structure:

   - Use functional components
   - Implement prop types
   - Keep components focused
   - Follow naming conventions
   - Document props

2. Styling:

   - Use CSS modules
   - Follow BEM naming
   - Maintain consistency
   - Support themes
   - Handle responsiveness

3. Performance:

   - Memoize when needed
   - Lazy load components
   - Optimize re-renders
   - Handle loading states
   - Implement virtualization

4. Accessibility:

   - Use semantic HTML
   - Include ARIA labels
   - Handle keyboard navigation
   - Support screen readers
   - Test accessibility

5. Testing:
   - Write unit tests
   - Test interactions
   - Mock dependencies
   - Test edge cases
   - Maintain coverage

## Component Dependencies

- react
- react-dom
- @emotion/styled
- framer-motion
- react-query
- react-router-dom
