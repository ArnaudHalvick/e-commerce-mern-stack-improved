import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Custom hook for Auth form handling
 *
 * @returns {Object} Form handling methods and state
 */
const useAuthForm = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, signup, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const switchState = () => {
    setState((prevState) => (prevState === "Signup" ? "Login" : "Signup"));
  };

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (state === "Signup" && !termsAccepted) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (state === "Login") {
      await login(formData.email, formData.password);
    } else {
      const result = await signup(formData);

      // Check if signup requires email verification
      if (result && result.success && result.requiresVerification) {
        // Redirect to verification pending page with email
        navigate("/verify-pending", {
          state: { email: formData.email },
        });
      }
    }
  };

  return {
    state,
    formData,
    termsAccepted,
    loading,
    error,
    setTermsAccepted,
    switchState,
    changeHandler,
    handleSubmit,
  };
};

export default useAuthForm;
