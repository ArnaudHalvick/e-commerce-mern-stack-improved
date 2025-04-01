import { useAuth } from "../../hooks/state";
import LoadingScreen from "../loadingScreen/LoadingScreen";

/**
 * AuthGuard component that can be used to show loading state during authentication
 * or protect routes that require authentication
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {boolean} props.requireAuth - Whether auth is required (for protected routes)
 * @param {React.ReactNode} props.fallback - Component to show during loading
 * @returns {JSX.Element} - Protected content or loading state
 */
const AuthGuard = ({ children, requireAuth = false, fallback = null }) => {
  const { loading, inTransition } = useAuth();

  // Show loading state if auth is still being determined or during transitions
  if (loading || inTransition) {
    return <LoadingScreen message="Loading authentication..." />;
  }

  // Auth state is determined, render children
  return children;
};

export default AuthGuard;
