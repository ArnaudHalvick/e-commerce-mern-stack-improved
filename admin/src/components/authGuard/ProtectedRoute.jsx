import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/auth/AuthContext";
import Spinner from "../ui/spinner/Spinner";

/**
 * ProtectedRoute component to guard admin routes
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} [props.redirectTo='/login'] - Path to redirect to if not authenticated
 */
const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Get the correct redirect path and add the current route as a query parameter
  const getRedirectPath = () => {
    // We are already inside the React Router context with basename set,
    // so we should use relative paths within the router context

    // Remove any leading slash to make it a relative path within the router context
    const relativePath = redirectTo.startsWith("/")
      ? redirectTo.substring(1)
      : redirectTo;

    // Add the current path as a query parameter so we can redirect back after login
    // Only add this if we're not already on the login page (to avoid circular redirects)
    const currentPath = location.pathname;
    const shouldAddRedirectParam = !currentPath.includes("/login");

    // Create the path with query parameter if needed
    const redirectPath = shouldAddRedirectParam
      ? `${relativePath}?from=${encodeURIComponent(currentPath)}`
      : relativePath;

    console.log(`Redirecting from ${currentPath} to ${redirectPath}`);
    return redirectPath;
  };

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="admin-protected-route-loading">
        <Spinner size="large" fullPage />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Use Navigate component for proper routing with relative path
    return (
      <Navigate to={getRedirectPath()} replace state={{ from: location }} />
    );
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
