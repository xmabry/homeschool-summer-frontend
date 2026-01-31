import React, { useState } from 'react';
import '../styles/ForgotPassword.css';
import ErrorResponse from './ErrorResponse';

const ForgotPassword = ({ onClose, onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      setMessage('Error sending reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Reset Password</h2>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{message}</p>
            <button 
              className="back-button"
              onClick={onBack}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
      
      <ErrorResponse 
        error={(message && !isSuccess) ? { message } : null}
        onDismiss={() => {
          setMessage('');
        }}
      />
    </div>
  );
};

export default ForgotPassword;