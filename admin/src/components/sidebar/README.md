# Sidebar Component

## Overview

The Sidebar component provides the main navigation menu for the admin dashboard. It displays a collapsible sidebar with icons and labels for each navigation item, allowing users to quickly access different sections of the admin interface.

## Directory Structure

```
sidebar/
├── Sidebar.jsx - Main sidebar component implementation
└── Sidebar.css - CSS styles for the sidebar
```

## Features

- **Collapsible Design**: Can be toggled between expanded and collapsed states
- **Active Route Highlighting**: Visually indicates the current active route
- **Icon-based Navigation**: Uses icons alongside text for better visual recognition
- **Keyboard Accessibility**: Supports keyboard navigation for accessibility
- **Scrollable Content**: Handles overflow with scrolling for many menu items
- **Responsive Behavior**: Adapts to different screen sizes and states

## Usage

```jsx
import { Sidebar } from "../components/sidebar";

// Basic usage
<Sidebar isOpen={isSidebarOpen} />;
```

## Props

| Prop   | Type    | Required | Default | Description                              |
| ------ | ------- | -------- | ------- | ---------------------------------------- |
| isOpen | Boolean | Yes      | -       | Controls whether the sidebar is expanded |

## Navigation Structure

The sidebar includes navigation links to the following sections:

- Dashboard (Home)
- Add Product
- Product List
- Orders
- Customers
- Analytics
- Settings

Each navigation item includes:

- Icon: Visual representation of the section
- Label: Text description of the section
- Active state: Visual indication when the section is currently active

## Styling

The component uses a dedicated CSS file with:

- Transitions for smooth open/close animations
- Hover effects for interactive elements
- Active state styling for current route
- Custom scrollbar styling
- Responsive width adjustments

## Accessibility Features

The sidebar implements accessibility features including:

- Keyboard navigation support through tabindex
- ARIA attributes for current page indication
- Sufficient color contrast for text legibility
- Keyboard event handling for navigation

## Integration with Router

The sidebar uses React Router's `useLocation` hook to determine the current route and apply the appropriate active state styling to navigation items.

## Mobile Considerations

For mobile views, the sidebar can be fully collapsed and reopened via the toggle button in the navbar to maximize the available content space.
