// Path: frontend/src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store";

// Force localhost in development mode to prevent IP address issues
if (
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_ENV === "development"
) {
  // Only change window.location if we're not already on localhost
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)
  ) {
    // Don't redirect if we're already on localhost or not on an IP address
    const port = window.location.port ? `:${window.location.port}` : "";
    const path =
      window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(`http://localhost${port}${path}`);
  }
}

// Log the environment for debugging
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`REACT_APP_ENV: ${process.env.REACT_APP_ENV}`);
console.log(`Hostname: ${window.location.hostname}`);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
