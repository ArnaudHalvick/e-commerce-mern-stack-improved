# Admin Panel Frontend

## Overview

The Admin Panel is a comprehensive dashboard for managing the e-commerce platform. It provides interfaces for product management, order processing, user administration, and business analytics. Built with React and designed with a modular architecture, the admin panel ensures secure access to administrative functions through JWT authentication.

## Features

- **Secure Authentication**: JWT-based authentication system
- **Product Management**: Create, edit, delete, and organize products
- **Order Processing**: View and manage customer orders
- **User Management**: Administer user accounts and permissions
- **Dashboard Analytics**: Overview of key business metrics
- **Responsive Design**: Works on desktop and tablet devices
- **Error Handling**: Comprehensive error management system
- **Image Management**: Upload and organize product images

## Technologies

- **React**: UI library (v19.0)
- **React Router**: Navigation and routing (v7.3)
- **Axios**: HTTP client for API requests
- **Vite**: Build tool and development server
- **CSS**: Custom styling without external frameworks
- **JWT**: Authentication mechanism

## Project Structure

```
admin/
├── public/ - Static assets
├── src/
│   ├── api/ - API client and services
│   │   ├── client.js - Core API client
│   │   ├── config.js - API configuration
│   │   └── services/ - API service modules
│   ├── components/ - Reusable UI components
│   │   ├── authGuard/ - Authentication protection
│   │   ├── errorHandling/ - Error management
│   │   ├── imageGallery/ - Image management
│   │   ├── navbar/ - Top navigation
│   │   ├── productEditModal/ - Product editing
│   │   ├── sidebar/ - Side navigation
│   │   └── ui/ - Shared UI elements
│   ├── context/ - State management
│   │   ├── auth/ - Authentication state
│   │   ├── error/ - Error handling state
│   │   ├── product/ - Product management state
│   │   └── exports/ - Context exports
│   ├── pages/ - Main application pages
│   │   ├── addProduct/ - Add product functionality
│   │   ├── admin/ - Main dashboard
│   │   ├── auth/ - Login page
│   │   └── listProduct/ - Product listing
│   └── utils/ - Utility functions
├── .env - Environment configuration
├── vite.config.js - Vite configuration
├── package.json - Dependencies and scripts
└── index.html - HTML entry point
```

## Core Modules

### Authentication

A secure JWT-based authentication system:

- Login page with form validation
- JWT token storage and management
- Protected routes for authenticated users
- Session persistence across page refreshes

### API Client

A robust API client for backend communication:

- Centralized request handling
- Authentication token management
- Comprehensive error handling
- Request/response interceptors
- Environment-aware configuration

### Context System

A React Context-based state management system:

- Auth Context for authentication state
- Error Context for centralized error handling
- Product Context for product management
- Export structure optimized for Fast Refresh

### UI Component Library

A collection of reusable UI components:

- Buttons, inputs, selects, and other form elements
- Cards, tables, and layout components
- Modal dialogs for interactive operations
- Loading indicators and error displays
- Image gallery for product image management

### Page Components

The main application pages:

- Dashboard for key metrics and overview
- Product management for catalog administration
- Login page for authentication
- Additional administrative interfaces

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the admin directory
3. Install dependencies:

```bash
cd admin
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

For Docker development:

```bash
npm run dev:docker
```

### Building for Production

Build the production version:

```bash
npm run build
```

### Environment Configuration

Create an `.env` file with these variables:

```
VITE_API_URL=http://localhost:4001
VITE_DEFAULT_PROTOCOL=http
VITE_IS_DOCKER=false
```

## Docker Support

The admin panel includes Docker configuration for both development and production:

- `Dockerfile` - Production container
- `Dockerfile.dev` - Development container
- `docker-entrypoint.sh` - Startup script
- `admin-nginx.conf` - Nginx configuration

### Running with Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up admin

# Production
docker-compose up admin
```

## Architecture Design

### Modular Component Structure

Each major feature is organized in a modular structure:

```
feature/
├── components/ - UI components
├── hooks/ - Custom React hooks
├── styles/ - CSS styling
└── index.js - Public exports
```

### State Management Strategy

State management uses React's Context API with:

- Reducer pattern for complex state
- Custom hooks for abstraction
- Optimized structure for React Fast Refresh

### API Integration

The API client uses a service-based architecture:

- Core client with authentication and error handling
- Service modules for domain-specific operations
- URL utilities for consistent endpoint formatting

### Error Handling

Comprehensive error handling with:

- Centralized error management
- Toast notifications for user feedback
- Loading states for asynchronous operations
- Error boundaries for component failures

## Contributing

1. Follow the established project structure
2. Maintain consistent code style and naming conventions
3. Write descriptive commit messages
4. Update documentation for significant changes
5. Test thoroughly before submitting changes

## License

Proprietary - All rights reserved
