// Path: admin/src/components/sidebar/Sidebar.jsx
import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";
import add_product_icon from "../../assets/admin_assets/Product_Cart.svg";
import list_product_icon from "../../assets/admin_assets/Product_list_icon.svg";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "🏠", // Replace with proper icon
    },
    {
      name: "Add Product",
      path: "/add-product",
      icon: add_product_icon,
    },
    {
      name: "Product List",
      path: "/list-product",
      icon: list_product_icon,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: "📦", // Replace with proper icon
    },
    {
      name: "Customers",
      path: "/customers",
      icon: "👥", // Replace with proper icon
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "📊", // Replace with proper icon
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙️", // Replace with proper icon
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleKeyDown = (e, path) => {
    if (e.key === "Enter" || e.key === " ") {
      window.location.href = path;
    }
  };

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="admin-sidebar-content admin-scrollbar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Menu</h2>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`admin-sidebar-item ${
                isActive(item.path) ? "active" : ""
              }`}
              tabIndex="0"
              onKeyDown={(e) => handleKeyDown(e, item.path)}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <div className="admin-sidebar-icon">
                {typeof item.icon === "string" ? (
                  <span className="admin-sidebar-emoji">{item.icon}</span>
                ) : (
                  <img src={item.icon} alt={`${item.name} icon`} />
                )}
              </div>
              <span className="admin-sidebar-label">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
