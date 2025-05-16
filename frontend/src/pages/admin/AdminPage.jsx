import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/state";
import { toggleAdmin } from "../../redux/slices/userSlice";
import styles from "./AdminPage.module.css";

const AdminPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5173/login"
      : "https://admin.mernappshopper.xyz/login";

  // Update isAdmin whenever the user object changes
  useEffect(() => {
    if (user) {
      setIsAdmin(!!user.isAdmin);
    }
  }, [user]);

  const handleToggleAdmin = async () => {
    if (!isAuthenticated) {
      setMessage("You must be logged in to toggle admin status");
      return;
    }

    try {
      setMessage(""); // Clear previous messages
      const resultAction = await dispatch(toggleAdmin());

      if (toggleAdmin.fulfilled.match(resultAction)) {
        // Success is handled by the reducer updating the state
        setMessage(isAdmin ? "Admin status removed" : "You are now an admin");
      } else if (toggleAdmin.rejected.match(resultAction)) {
        setMessage(resultAction.payload || "Failed to toggle admin status");
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      setMessage("An error occurred while toggling admin status");
    }
  };

  return (
    <div className={styles.adminPage}>
      <h1>Admin Access</h1>

      <div className={styles.adminInfo}>
        <p>Current status: {isAdmin ? "Admin" : "Regular User"}</p>

        <button
          className={styles.toggleButton}
          onClick={handleToggleAdmin}
          disabled={authLoading}
        >
          {authLoading
            ? "Processing..."
            : isAdmin
            ? "Remove Admin Status"
            : "Become Admin"}
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </div>

      <div className={styles.adminPanel}>
        <h2>Admin Panel Access</h2>
        <p>To access the full admin panel, visit:</p>
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adminLink}
        >
          {adminUrl}
        </a>
      </div>
    </div>
  );
};

export default AdminPage;
