import React from 'react';
import '../styles/ErrorResponse.css';

const ErrorResponse = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="error-response">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h3>Something went wrong</h3>
          <p>{error.message || 'An unexpected error occurred. Please try again.'}</p>
          {error.details && (
            <details className="error-details">
              <summary>Technical details</summary>
              <pre>{error.details}</pre>
            </details>
          )}
        </div>
        <div className="error-actions">
          {onRetry && (
            <button className="retry-button" onClick={onRetry}>
              Try Again
            </button>
          )}
          {onDismiss && (
            <button className="dismiss-button" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorResponse;