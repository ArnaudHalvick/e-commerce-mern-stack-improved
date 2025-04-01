import { useAuth } from "../../hooks/state";
import { InlineSpinner } from "../ui/spinner";
import styles from "./AuthLoadingIndicator.module.css";

/**
 * Global authentication loading indicator
 * Displays at the top of the page when auth-related operations are in progress
 */
const AuthLoadingIndicator = () => {
  const { loading, inTransition } = useAuth();

  // During login/logout transitions, block the entire UI with a more prominent indicator
  if (inTransition) {
    return (
      <div className="auth-transition-overlay">
        <div className="auth-transition-content">
          <InlineSpinner size="large" message="Please wait..." />
        </div>
      </div>
    );
  }

  // Show a subtle loading bar for regular auth operations
  if (loading) {
    return (
      <div className={styles.loadingBar}>
        <div className={styles.barAnimation}></div>
      </div>
    );
  }

  return null;
};

export default AuthLoadingIndicator;
