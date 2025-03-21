import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// This component can be wrapped around your entire app or specific sections
// to prevent any content from rendering until auth state is determined
const AuthGuard = ({ children, loadingFallback = null }) => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return loadingFallback || null;
  }

  return children;
};

export default AuthGuard;
