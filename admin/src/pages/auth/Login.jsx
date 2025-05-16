import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../../context/auth/AuthContext";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Spinner from "../../components/ui/spinner/Spinner";
import Toast from "../../components/errorHandling/toast/components/Toast";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectTarget, setRedirectTarget] = useState("/");

  const { login, isAuthenticated, loading, error, clearErrors } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for infinite redirect loops in URL (multiple /login segments)
    const currentPath = window.location.pathname;
    const loginPattern = /\/login/g;
    const matches = currentPath.match(loginPattern) || [];

    if (matches.length > 1) {
      // More than one /login in the URL - fix it by setting the correct path
      const fixedPath = "/login";

      // Use replaceState to update the URL without triggering a navigation
      window.history.replaceState(null, "", fixedPath);
    }

    // Extract the referrer from URL if it exists (e.g., ?from=/admin/products)
    const params = new URLSearchParams(location.search);
    const from = params.get("from");

    if (from) {
      // If there's a referrer in the URL, use it for redirect
      setRedirectTarget(from);
    }

    // If already authenticated, navigate to the dashboard within admin
    if (isAuthenticated) {
      navigate(redirectTarget);
    }

    // Show error toast if login fails
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  }, [isAuthenticated, error, navigate, location, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      setShowError(true);
      return;
    }

    const success = await login({ email, password });

    if (success) {
      // This ensures we stay within the /admin path context after login
      navigate(redirectTarget);
    }
  };

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleCloseError = () => {
    setShowError(false);
    clearErrors();
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Enter your credentials to access the admin dashboard</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
            fullWidth
            autoComplete="username"
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            required
            fullWidth
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            disabled={loading}
          >
            {loading ? <Spinner size="small" /> : "Login"}
          </Button>
        </form>
      </div>

      {showError && (
        <Toast
          message={errorMessage || "Login failed. Please try again."}
          variant="error"
          isVisible={showError}
          onClose={handleCloseError}
        />
      )}
    </div>
  );
};

export default Login;
