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
  console.log("Using basePath from runtime config:", basePath);
} else {
  basePath =
    import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || "/admin";
  console.log("Using basePath from environment:", basePath);
}

// Trim trailing slash for consistency with react-router-dom
// React Router doesn't expect a trailing slash in the basename
const normalizedBasePath = basePath.endsWith("/")
  ? basePath.slice(0, -1)
  : basePath;

console.log("Admin app starting with:");
console.log("- normalized basename:", normalizedBasePath);
console.log("- BASE_URL:", import.meta.env.BASE_URL);
console.log("- VITE_BASE_PATH:", import.meta.env.VITE_BASE_PATH);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={normalizedBasePath}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
