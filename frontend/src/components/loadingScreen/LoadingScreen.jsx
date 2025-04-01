import React from "react";
import { InlineSpinner } from "../ui/spinner";

/**
 * Full-page loading screen with optional message
 *
 * @param {Object} props
 * @param {string} props.message - Message to display
 */
const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div
      className="loading-screen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        minHeight: "300px",
      }}
    >
      <InlineSpinner size="medium" message={message} />
    </div>
  );
};

export default LoadingScreen;
