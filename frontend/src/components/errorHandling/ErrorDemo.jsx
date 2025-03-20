import React, { useState } from "react";
import { useError } from "../../context/ErrorContext";
import "./ErrorStyles.css";

/**
 * Error Demonstration Component
 * Shows how to use the error handling system
 */
const ErrorDemo = () => {
  const { showError, showSuccess, showWarning, showInfo } = useError();
  const [message, setMessage] = useState("This is a test message");

  const handleShowError = () => {
    showError(message);
  };

  const handleShowSuccess = () => {
    showSuccess(message);
  };

  const handleShowWarning = () => {
    showWarning(message);
  };

  const handleShowInfo = () => {
    showInfo(message);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="error-demo-container">
      <h2>Error Handling Demonstration</h2>
      <p>
        This component demonstrates how to use the error handling system in your
        application.
      </p>

      <div className="error-demo-form">
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <input
            type="text"
            id="message"
            value={message}
            onChange={handleMessageChange}
            className="form-control"
          />
        </div>

        <div className="error-demo-buttons">
          <button onClick={handleShowError} className="demo-button error">
            Show Error
          </button>
          <button onClick={handleShowWarning} className="demo-button warning">
            Show Warning
          </button>
          <button onClick={handleShowSuccess} className="demo-button success">
            Show Success
          </button>
          <button onClick={handleShowInfo} className="demo-button info">
            Show Info
          </button>
        </div>
      </div>

      <div className="error-demo-code">
        <h3>Usage Example:</h3>
        <pre>
          {`import { useError } from '../context/ErrorContext';

const YourComponent = () => {
  const { showError, showSuccess } = useError();
  
  const handleSubmit = async (formData) => {
    try {
      await api.submitData(formData);
      showSuccess('Data submitted successfully!');
    } catch (error) {
      showError(error.message);
    }
  };

  // Rest of your component...
}`}
        </pre>
      </div>
    </div>
  );
};

export default ErrorDemo;
