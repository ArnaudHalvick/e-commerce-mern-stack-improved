# Navbar Component

A modern, responsive navigation bar component for the e-commerce application with authentication integration and cart functionality.

## Features

- 🏠 Responsive navigation menu with mobile hamburger support
- 🔐 Authentication-aware UI with login/signup buttons
- 👤 User account dropdown menu
- 🛒 Cart integration with item count
- 🔗 Dynamic route navigation
- 📱 Mobile-friendly design

## Components

### 1. Navbar.jsx

The main navigation component that handles:

- Logo and branding
- Navigation menu items (Home, Men, Women, Kids, Shop)
- Authentication state management
- User account dropdown
- Cart icon with count
- Mobile responsiveness

#### Props

- No direct props required - uses context for state management

#### Context Dependencies

- `AuthContext` for authentication state
- Redux store for cart state

### 2. CartCount.jsx

A sub-component that displays the number of items in the user's cart:

- Integrates with Redux store for cart state
- Updates automatically when cart changes
- Only shows count for authenticated users

#### Dependencies

- Redux store
- `AuthContext`

## Usage

```jsx
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      {/* Other components */}
    </div>
  );
}
```

## Styling

The component uses a dedicated CSS module (`Navbar.css`) for styling with features including:

- Responsive design
- Mobile menu animations
- Dropdown menu styling
- Active state indicators
- Hover effects

## Authentication States

The navbar adapts to different authentication states:

### Unauthenticated

- Shows Login/Signup buttons
- Cart count displays 0
- Limited functionality

### Authenticated

- Displays user's name
- Shows user account dropdown
- Enables cart functionality
- Full navigation access

## Mobile Responsiveness

The navbar is fully responsive with:

- Hamburger menu for mobile devices
- Collapsible navigation items
- Adapted dropdown positioning
- Touch-friendly interactions

## Dependencies

- React Router DOM for navigation
- Redux for cart state management
- React Context for authentication
- CSS modules for styling

## File Structure

```
navbar/
├── Navbar.jsx        # Main navigation component
├── CartCount.jsx     # Cart counter component
├── Navbar.css        # Styles for navbar
└── README.md         # Documentation
```
