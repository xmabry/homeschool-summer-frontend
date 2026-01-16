import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(username, password);
      
      if (!result.success) {
        setLocalError(result.error || 'Login failed');
      }
      // If successful, the AuthContext will handle the user state
    } catch (err) {
      setLocalError('An unexpected error occurred');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-header">Login</h2>
        
        {/* Display errors */}
        {(error || localError) && (
          <div className="error-message">
            {error || localError}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Login'}
        </button>

        <div className="login-links">
          <a href="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </a>
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;