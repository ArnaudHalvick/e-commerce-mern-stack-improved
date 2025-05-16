// Path: admin/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Get the base path from runtime config first, then env vars, then fallback
let basePath;
if (window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.basePath) {
  basePath = window.RUNTIME_CONFIG.basePath;
} else {
  basePath =
    import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || "/admin";
}

// Trim trailing slash for consistency with react-router-dom
// React Router doesn't expect a trailing slash in the basename
const normalizedBasePath = basePath.endsWith("/")
  ? basePath.slice(0, -1)
  : basePath;

// Only use a non-empty basename when it's not just "/"
// This prevents issues with empty basenames in React Router
const routerBasename =
  normalizedBasePath && normalizedBasePath !== "/" ? normalizedBasePath : "";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
