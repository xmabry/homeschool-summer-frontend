import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Logout.css';

const LogoutHeader = ({ onViewChange }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    // Redirect to feedback page first if callback is provided
    if (onViewChange) {
      onViewChange('feedback');
      // Add a small delay to show feedback page before logout
      setTimeout(async () => {
        await logout();
      }, 500);
    } else {
      // Fallback to immediate logout if no callback
      await logout();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Homeschool Activity Generator</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default LogoutHeader;