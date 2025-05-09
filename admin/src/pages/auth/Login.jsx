import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/auth/AuthContext";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Spinner from "../../components/ui/spinner/Spinner";
import Toast from "../../components/ui/errorHandling/toast/Toast";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);

  const { login, isAuthenticated, loading, error, clearErrors } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/");
    }

    // Show error toast if login fails
    if (error) {
      setShowError(true);
    }
  }, [isAuthenticated, error, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    const success = await login({ email, password });

    if (success) {
      navigate("/");
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
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            required
            fullWidth
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
          message={error}
          variant="error"
          isVisible={showError}
          onClose={handleCloseError}
        />
      )}
    </div>
  );
};

export default Login;
