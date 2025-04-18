# Profile Component Refactoring

This folder contains the refactored Profile page components, which follows modern React best practices for separation of concerns and custom hooks.

## Structure

```
profile/
├── components/            # UI Components
│   ├── AccountManager.jsx
│   ├── BasicInfoSection.jsx
│   ├── DisableAccountModal.jsx
│   ├── EmailManager.jsx
│   ├── EmailVerification.jsx
│   ├── PasswordManager.jsx
│   ├── ShippingAddressSection.jsx
│   └── index.js
├── hooks/                 # Custom hooks for business logic
│   ├── useAccountManagement.js
│   ├── usePasswordForm.js
│   ├── useProfileForm.js
│   └── index.js
├── styles/                # Centralized styles
│   ├── AccountManager.css
│   ├── BasicInfoSection.css
│   ├── DisableAccountModal.css
│   ├── EmailManager.css
│   ├── EmailVerification.css
│   ├── PasswordManager.css
│   ├── Profile.css
│   ├── ShippingAddressSection.css
│   └── index.css          # Main CSS entry point that imports all styles
├── index.jsx              # Main Profile container component
└── README.md              # Documentation
```

## Separation of Concerns

The refactoring follows these principles:

1. **Custom Hooks**: Business logic is extracted into custom hooks:

   - `useProfileForm`: Manages profile form state and validation
   - `usePasswordForm`: Manages password form state and validation
   - `useAccountManagement`: Handles account operations (disabling, verification)

2. **UI Components**: Components focus on rendering and user interaction

   - Each component receives only the props it needs
   - State management is delegated to custom hooks
   - Components are more focused and maintainable

3. **Container Component**: The main Profile component acts as a container

   - Coordinates state and hooks
   - Passes data down to child components
   - Handles page-level effects and redirects

4. **Centralized Styles**: CSS files are organized in a dedicated folder
   - All styles are imported through a single entry point (index.css)
   - Components no longer need to import their CSS files directly
   - Easier to maintain and update styles across the application

## Benefits

- **Improved Testability**: Logic is isolated in hooks, making it easier to test
- **Better Code Organization**: Clear separation between logic and UI
- **Reusability**: Hooks can be reused across different components
- **Maintainability**: Smaller files that are easier to understand and update
- **Performance**: More optimized re-renders due to better state management
- **Simplified CSS Management**: Single point of entry for all styles

## Usage

The main Profile component incorporates all the hooks and passes the necessary props to each UI component. Each component now has a single responsibility, making the code more maintainable and easier to understand.
