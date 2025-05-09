// Path: admin/src/App.jsx
import { useState, useEffect } from "react";
import NavBar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import Admin from "./pages/admin/Admin";
import { ErrorState } from "./context/index.jsx";
import "./App.css";

function App() {
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
    <ErrorState>
      <div className="admin-container">
        <NavBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="admin-main">
          <Sidebar isOpen={sidebarOpen} />
          <div className={`admin-content ${sidebarOpen ? "sidebar-open" : ""}`}>
            <Admin />
          </div>
        </div>
      </div>
    </ErrorState>
  );
}

export default App;
