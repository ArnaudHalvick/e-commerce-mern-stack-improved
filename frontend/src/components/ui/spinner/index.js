/**
 * Spinner Component Exports
 * This file centralizes all spinner-related exports for the application
 */

// Import spinner for default export
import Spinner from "./Spinner";

// Export default spinner
export { default as Spinner } from "./Spinner";

// Export utility spinner components
export {
  InlineSpinner,
  LoadingContainer,
  FullPageLoader,
} from "./SpinnerUtils";

// Export as default for backwards compatibility
export default Spinner;
