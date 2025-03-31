import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { InlineSpinner } from "../ui/spinner";

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
  const { loading, inTransition } = useContext(AuthContext);

  // Show loading state if auth is still being determined or during transitions
  if (loading || inTransition) {
    return (
      fallback || (
        <div
          className="auth-guard-loading"
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <InlineSpinner size="medium" message="Loading..." />
        </div>
      )
    );
  }

  // Auth state is determined, render children
  return children;
};

export default AuthGuard;
