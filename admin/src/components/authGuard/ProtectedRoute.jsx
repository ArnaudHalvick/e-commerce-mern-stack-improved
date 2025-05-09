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
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
