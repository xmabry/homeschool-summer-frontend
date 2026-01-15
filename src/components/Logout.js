import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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

export default Header;