import React, { useState } from "react";
import useErrorRedux from "../../../hooks/useErrorRedux";
import { apiClient } from "../../../api";
import "../styles/DemoStyles.css";
import Spinner from "../../ui/spinner";

const ErrorDemo = () => {
  const { showError, showSuccess, showWarning, showInfo } = useErrorRedux();
  const [message, setMessage] = useState("This is a test message");
  const [apiPath, setApiPath] = useState("/api/error-demo/test-error");
  const [statusCode, setStatusCode] = useState(404);

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

  const handleThrowError = () => {
    throw new Error(message);
  };

  const handleApiError = async () => {
    try {
      await apiClient.get(`${apiPath}?statusCode=${statusCode}`);
    } catch (error) {
      // Show error with status code if available
      const errorMessage = error.status
        ? `[${error.status}] ${error.message}`
        : error.message;
      showError(errorMessage);
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleApiPathChange = (e) => {
    setApiPath(e.target.value);
  };

  const handleStatusCodeChange = (e) => {
    setStatusCode(parseInt(e.target.value, 10));
  };

  return (
    <div className="error-demo-container">
      <h2>Error Handling Demonstration</h2>
      <p>
        This component demonstrates how to use the error handling system in your
        application.
      </p>
      <div className="error-demo-section">
        <p className="error-demo-note">
          <strong>Note:</strong> You don't need to be logged in to use this demo
          page. It's designed to demonstrate error handling capabilities
          regardless of authentication status.
        </p>
      </div>
      <div className="error-demo-section">
        <h3>1. Toast Notifications</h3>
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
      </div>
      <div className="error-demo-section">
        <h3>2. API Error Handling</h3>
        <p>
          Test how the application handles API errors using our axios
          interceptors.
        </p>
        <div className="error-demo-form">
          <div className="form-group">
            <label htmlFor="apiPath">API Path:</label>
            <input
              type="text"
              id="apiPath"
              value={apiPath}
              onChange={handleApiPathChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="statusCode">Status Code:</label>
            <select
              id="statusCode"
              value={statusCode}
              onChange={handleStatusCodeChange}
              className="form-control"
            >
              <option value={400}>400 - Bad Request</option>
              <option value={401}>401 - Unauthorized</option>
              <option value={403}>403 - Forbidden</option>
              <option value={404}>404 - Not Found</option>
              <option value={422}>422 - Validation Error</option>
              <option value={500}>500 - Server Error</option>
            </select>
          </div>
          <button onClick={handleApiError} className="demo-button api-error">
            Simulate API Error
          </button>
        </div>
      </div>
      <div className="error-demo-section">
        <h3>3. Error Boundary Testing</h3>
        <p>
          Test the ErrorBoundary component by intentionally throwing an error.
          This will be caught by the ErrorBoundary and show a fallback UI.
        </p>
        <button
          onClick={handleThrowError}
          className="demo-button runtime-error"
        >
          Throw Runtime Error
        </button>
      </div>
      <div className="error-demo-section">
        <h3>Loading Spinner Test</h3>
        <Spinner message="Loading..." size="medium" />
      </div>
      <div className="error-demo-code">
        <h3>Usage Example:</h3>
        <pre>
          {`import { useDispatch } from 'react-redux';
import useErrorRedux from '../hooks/useErrorRedux';
import { apiClient } from '../api';

const YourComponent = () => {
  const { showError, showSuccess } = useErrorRedux();
  
  const handleSubmit = async (formData) => {
    try {
      await apiClient.post('/api/data', formData);
      showSuccess('Data submitted successfully!');
    } catch (error) {
      showError(error.message);
    }
  };
  
  // Rest of your component...
};`}
        </pre>
      </div>
    </div>
  );
};

export default ErrorDemo;
