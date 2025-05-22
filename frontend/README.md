# E-Commerce Platform - React Frontend

A modern, responsive, and feature-rich React frontend for the e-commerce platform. This implementation showcases best practices in frontend development, component architecture, state management, and user experience design.

![React](https://img.shields.io/badge/React-v19.x-blue)
![Redux](https://img.shields.io/badge/Redux-v5.x-purple)
![Stripe](https://img.shields.io/badge/Stripe-v6.x-blue)
![React Router](https://img.shields.io/badge/React_Router-v7.x-orange)

## 🚀 Key Features

- **Dynamic Product Catalog**

  - Responsive product grid with filtering and sorting
  - Detailed product pages with image galleries
  - Category and search navigation
  - Infinite scroll product loading

- **Seamless Shopping Experience**

  - Intuitive cart management
  - Streamlined checkout process
  - Order confirmation and history
  - Wishlist functionality

- **Secure User Authentication**

  - JWT-based authentication flow
  - Protected routes with auth guards
  - Account verification via email
  - Profile management

- **Integrated Payment Processing**

  - Stripe Elements integration
  - Credit card processing
  - Order status tracking
  - Secure payment flow

- **Advanced UI/UX Features**

  - Responsive design for all devices
  - Animated transitions and interactions
  - Form validation with error handling
  - Loading state management

- **Native SEO Implementation**
  - React 19's Document Metadata API
  - Dynamic metadata updates
  - Structured data for rich search results
  - Social media sharing optimization

## 🏗️ Application Architecture

The frontend follows a structured, modular architecture:

```
├── components/       # Reusable UI components
├── pages/            # Full page components
├── hooks/            # Custom React hooks
├── redux/            # State management
│   └── slices/       # Redux toolkit slices
├── api/              # API service layer
├── utils/            # Utility functions
│   └── SEO.jsx       # SEO component using React 19's Document Metadata
└── stripe/           # Payment integration
```

### Component Structure

Components follow a consistent organization pattern:

```
component/
├── components/       # Sub-components
├── hooks/            # Component-specific hooks
├── styles/           # Component styling
└── utils/            # Component utilities
```

## 🎨 UI Component Library

The application includes a comprehensive set of UI components:

- **Product Components**: Product cards, galleries, detail views
- **Navigation**: Navbar, breadcrumbs, filters, search
- **Shopping**: Cart items, checkout forms, order summaries
- **User Interface**: Modals, dropdowns, forms, buttons, loaders
- **Layout**: Containers, grids, sections, responsive wrappers

## 🔄 State Management

State is managed using Redux with Redux Toolkit:

- **Global Store**: User, cart, products, and UI state
- **Slices**: Modular state organization by feature
- **Async Actions**: API integration with thunks
- **Selectors**: Optimized data access patterns

## 🔒 Authentication Flow

The application implements a secure authentication system:

1. **Login/Registration**: Form submission with validation
2. **Token Management**: JWT storage and refresh
3. **Route Protection**: Auth guards for protected routes
4. **Session Handling**: Auto-logout on token expiration
5. **Profile Management**: User data updates and preferences

## 💳 Payment Integration

Seamless Stripe integration for payment processing:

- **Stripe Elements**: Secure credit card collection
- **Payment Intent**: Server coordination for payment processing
- **Order Creation**: Automatic order generation after payment
- **Confirmation**: Real-time payment confirmation

## 🔍 SEO Implementation

The application uses React 19's native Document Metadata feature for SEO:

- **Native Implementation**: No third-party libraries (like react-helmet)
- **Dynamic Metadata**: Updates metadata based on page content
- **Social Media Optimization**: Open Graph and Twitter Card tags
- **Structured Data**: JSON-LD support for rich search results
- **Canonical URLs**: Prevents duplicate content issues

### SEO Component Usage

```jsx
// Example usage in a product page
<SEO
  title={product.name}
  description={product.description}
  keywords={product.tags.join(", ")}
  image={product.image}
  url={`/products/${product.slug}`}
  type="product"
  strategy="replace"
>
  {/* Optional JSON-LD structured data */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      // ...other product properties
    })}
  </script>
</SEO>
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd e-commerce-mern-stack-improved/frontend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## 🧪 Development Features

- **Development Mode**: Hot-reloading development server
- **Error Boundaries**: Graceful error handling in components
- **Responsive Testing**: Support for all device sizes
- **Docker Support**: Containerized development environment

## 🚀 Deployment

The frontend is configured for deployment with Docker:

```bash
# Build and run using Docker
docker-compose up -d
```

## Environment Configuration

The frontend uses a simplified environment configuration:

1. **`.env`** - Contains production configuration defaults

   - Used for production builds
   - Contains placeholders for sensitive information (e.g., Stripe keys)

2. **`.env.local`** - Contains local development overrides
   - Created automatically by development scripts
   - Not committed to version control
   - Takes precedence over `.env` when running locally

### Docker Development

When running in Docker, environment variables are injected directly through:

- Docker Compose environment settings
- The entrypoint script loads secrets (like Stripe keys)

The following environment variables control the SEO functionality:

| Variable                          | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `REACT_APP_USE_DOCUMENT_METADATA` | Enables React 19's Document Metadata feature      |
| `REACT_APP_META_MERGE_STRATEGY`   | Controls metadata strategy ("replace" or "merge") |

This approach simplifies configuration management while maintaining flexibility across environments.

---

## Portfolio Project Information

This frontend implementation demonstrates expertise in:

- Modern React development patterns
- Responsive UI design and implementation
- State management in complex applications
- Secure payment processing integration
- Authentication and authorization flows
- SEO optimization with native React features

The project follows best practices in component architecture, state management, and user experience design to create a performant, maintainable, and user-friendly e-commerce platform.
