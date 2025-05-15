import { useContext } from "react";
import { Navigate } from "react-router-dom";
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

  // Get the correct redirect path and add the current route as a query parameter
  const getRedirectPath = () => {
    // Always use the direct path for redirection, without any additional processing
    // This prevents path manipulation that could cause infinite redirects
    return redirectTo;
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
    console.log(
      `Protected route: not authenticated. Redirecting to ${redirectTo}`
    );
    // Use Navigate component with replace to avoid browser history buildup
    return <Navigate to={getRedirectPath()} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
