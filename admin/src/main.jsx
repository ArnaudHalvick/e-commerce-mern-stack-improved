// Path: admin/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

// Get the base path from environment variables
const basePath = import.meta.env.VITE_BASE_PATH || "/admin/";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
