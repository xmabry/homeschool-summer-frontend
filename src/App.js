// App.js

import { useAuth } from "react-oidc-context";
import { useState } from "react";
import GenerateActivityForm from "./components/GenerateActivityForm";
import HWHistory from "./components/HWHistory";
import "./styles/App.css";

function App() {
  const auth = useAuth();
  const [currentView, setCurrentView] = useState('generate'); // 'generate' or 'history'

  const signOutRedirect = () => {
    const clientId = import.meta.env.REACT_APP_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.REACT_APP_LOGOUT_URI;
    const cognitoDomain = import.meta.env.REACT_APP_COGNITO_DOMAIN;
    
    if (!clientId || !logoutUri || !cognitoDomain) {
      console.error('Missing required environment variables for logout');
      return;
    }
    
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Homeschool Activity Generator</h1>
          <div className="user-info">
            <span>Hello, {auth.user?.profile.email}</span>
            <button onClick={() => auth.removeUser()} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </header>
        
        <nav className="app-navigation">
          <button 
            onClick={() => setCurrentView('generate')}
            className={`nav-btn ${currentView === 'generate' ? 'active' : ''}`}
          >
            Generate Activity
          </button>
          <button 
            onClick={() => setCurrentView('history')}
            className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
          >
            Activity History
          </button>
        </nav>
        
        <main className="app-content">
          {currentView === 'generate' && (
            <GenerateActivityForm userToken={auth.user?.access_token} />
          )}
          {currentView === 'history' && (
            <HWHistory userToken={auth.user?.access_token} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default App;