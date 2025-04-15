// Import Auth for default export
import Auth from "./Auth";

// Barrel export file for Auth pages
export { default as Auth } from "./Auth";
export { default as ForgotPassword } from "./ForgotPassword";
export { default as ResetPassword } from "./ResetPassword";

// Add default export for backward compatibility
export default Auth;
