// Export only components for Fast Refresh compatibility
import ErrorState from "./error/ErrorState.jsx";

// We can export components directly since they don't affect Fast Refresh
export { ErrorState };

// Default export
export default { ErrorState };
