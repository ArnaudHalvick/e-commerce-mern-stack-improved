// Path: frontend/src/components/breadcrumbs/breadcrumb.jsx
import "./Breadcrumb.css";
import arrow_icon from "../assets/breadcrum_arrow.png";
import { Link } from "react-router-dom";
import React from "react";

/**
 * A reusable breadcrumb component that can be used across all pages
 * @param {Object} props - Component props
 * @param {Array} props.routes - Array of route objects
 * @param {Array} props.links - Legacy prop name for routes (for backward compatibility)
 * @param {string} props.routes[].label - Display label for the route
 * @param {string} props.routes[].path - URL path for the route (optional for last item)
 * @param {boolean} props.routes[].isCurrent - Whether this is the current page (applied to last item by default)
 */
const Breadcrumb = ({ routes = [], links }) => {
  // For backward compatibility, use links if provided (older components still use links prop)
  const breadcrumbRoutes = links || routes;

  // If no routes provided, show at least Home
  if (!breadcrumbRoutes || breadcrumbRoutes.length === 0) {
    breadcrumbRoutes = [{ label: "Home", path: "/" }];
  }

  return (
    <div className="breadcrumb">
      {breadcrumbRoutes.map((route, index) => {
        const isLast = index === breadcrumbRoutes.length - 1;
        const isCurrent = route.isCurrent || isLast;

        // Render current page as a span, others as links
        return (
          <React.Fragment key={`breadcrumb-${index}`}>
            {index > 0 && <img src={arrow_icon} alt="" />}

            {isCurrent ? (
              <span className="breadcrumb-current">{route.label}</span>
            ) : (
              <Link to={route.path} className="breadcrumb-link">
                {route.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
