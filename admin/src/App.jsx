// Path: admin/src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Admin from "./pages/admin/Admin";
import Login from "./pages/auth/Login";
import NotFound from "./components/ui/notFound/NotFound";
import ProtectedRoute from "./components/authGuard/ProtectedRoute";
import AuthProvider from "./context/auth/AuthProvider";
import { ErrorState } from "./context/index.jsx";

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

// A separate 404 component that doesn't use the admin layout
const PageNotFound = () => (
  <NotFound
    title="Page Not Found"
    message="The page you are looking for doesn't exist or has been moved."
    backTo="/login"
    backText="Go to Login"
  />
);

function App() {
  return (
    <ErrorState>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* 404 Page - Public, doesn't require auth */}
          <Route path="/not-found" element={<PageNotFound />} />

          {/* Protected Routes - With proper wildcard pattern to allow nested routes */}
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

          {/* All other unknown routes - redirect to not-found page */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorState>
  );
}

export default App;
