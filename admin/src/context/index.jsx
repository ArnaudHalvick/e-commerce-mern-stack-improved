// Export only components for Fast Refresh compatibility
import ErrorState from "./error/ErrorState.jsx";
import AuthProvider from "./auth/AuthProvider.jsx";

// We can export components directly since they don't affect Fast Refresh
export { ErrorState, AuthProvider };

// Default export
export default { ErrorState, AuthProvider };
