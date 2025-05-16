# Navbar Component

## Overview

The Navbar component provides the top navigation bar for the admin dashboard. It includes branding, navigation controls, search functionality, user profile information, and notifications.

## Directory Structure

```
navbar/
├── Navbar.jsx - Main navbar component implementation
└── Navbar.css - CSS styles for the navbar
```

## Features

- **Responsive Design**: Adapts to different screen sizes
- **Sidebar Toggle**: Button to toggle the sidebar visibility
- **User Profile**: Displays logged-in user information with dropdown menu
- **Notifications**: Shows notification count with dropdown for messages
- **Search**: Integrated search functionality
- **Navigation**: Breadcrumbs and page title integration

## Usage

```jsx
import { Navbar } from "../components/navbar";

// Basic usage
<Navbar
  toggleSidebar={handleToggleSidebar}
  isOpen={isSidebarOpen}
/>

// With page title
<Navbar
  toggleSidebar={handleToggleSidebar}
  isOpen={isSidebarOpen}
  pageTitle="Dashboard"
/>
```

## Props

| Prop          | Type     | Required | Default | Description                            |
| ------------- | -------- | -------- | ------- | -------------------------------------- |
| toggleSidebar | Function | Yes      | -       | Function to toggle sidebar visibility  |
| isOpen        | Boolean  | Yes      | -       | Current state of sidebar (open/closed) |
| pageTitle     | String   | No       | ""      | Title of the current page              |

## Component Structure

The Navbar is structured into several key areas:

1. **Left Section**:

   - Sidebar toggle button
   - App logo/branding
   - Page title and breadcrumbs

2. **Center Section**:

   - Search bar (expandable on mobile)

3. **Right Section**:
   - Notification button with counter
   - User profile with dropdown menu
   - Theme toggle (light/dark mode)

## Styling

The component uses a dedicated CSS file with:

- Responsive breakpoints for different screen sizes
- Consistent styling with the admin theme
- Dropdown animations and transitions
- Proper spacing and alignment

## Accessibility

The navbar implements accessibility features including:

- Keyboard navigation support
- Proper ARIA attributes for interactive elements
- Focus management for dropdown menus
- Color contrast compliance

## Integration

The navbar integrates with these app features:

- **Auth Context**: For user profile information
- **Theme Context**: For theme toggling (light/dark)
- **Router**: For navigation and breadcrumbs
- **Notification System**: For displaying notifications
