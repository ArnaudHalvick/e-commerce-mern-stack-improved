import React from "react";
import { Link } from "react-router-dom";
import "./ErrorStyles.css";

/**
 * EmptyState component - Used to display a user-friendly message when a section has no content
 *
 * @param {Object} props
 * @param {String} props.title - The main heading to display
 * @param {String} props.message - The descriptive message to show
 * @param {String} props.icon - Optional icon character/emoji to display (e.g., "🛒")
 * @param {Object[]} props.actions - Array of action buttons to display
 * @param {String} props.actions[].label - Button text
 * @param {String} props.actions[].to - Link destination (optional)
 * @param {Function} props.actions[].onClick - Click handler (optional)
 * @param {String} props.actions[].type - Button type ("primary" or "secondary")
 */
const EmptyState = ({
  title,
  message,
  icon = "📦",
  actions = [],
  className = "",
}) => {
  return (
    <div className={`empty-state-container ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-content">
        <h2>{title}</h2>
        <p>{message}</p>

        {actions.length > 0 && (
          <div className="empty-state-actions">
            {actions.map((action, index) => {
              // If action has a "to" prop, render a Link
              if (action.to) {
                return (
                  <Link
                    key={index}
                    to={action.to}
                    className={`empty-state-button ${action.type || "primary"}`}
                  >
                    {action.label}
                  </Link>
                );
              }

              // Otherwise, render a button
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`empty-state-button ${action.type || "primary"}`}
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
