// Path: admin/src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Admin from "./pages/admin/Admin";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/authGuard/ProtectedRoute";
import AuthProvider from "./context/auth/AuthProvider";
import { ErrorState } from "./context/index.jsx";

// Log configuration for debugging
console.log("=== Admin App Configuration ===");
console.log("Base URL:", import.meta.env.BASE_URL);
console.log("VITE_BASE_PATH:", import.meta.env.VITE_BASE_PATH);

// Check for runtime config
if (window.RUNTIME_CONFIG) {
  console.log("Runtime config found:", window.RUNTIME_CONFIG);
}

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 992;
      setIsMobile(isNowMobile);

      // Only auto-close sidebar if we're transitioning to mobile
      if (!isMobile && isNowMobile) {
        setSidebarOpen(false);
      }

      // Auto-open sidebar if transitioning to desktop
      if (isMobile && !isNowMobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-page-container">
      <NavBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="admin-page-main">
        <Sidebar isOpen={sidebarOpen} />
        <div
          className={`admin-page-content-area ${
            sidebarOpen ? "sidebar-open" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorState>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Any path within /* requires authentication */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect to dashboard if no route matches */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorState>
  );
}

export default App;
