// App.jsx

import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import cognitoService from "./services/cognitoService";
import GenerateActivityForm from "./components/GenerateActivityForm.jsx";
import HWHistory from "./components/HWHistory.jsx";
import Welcome from "./components/Welcome.jsx";
import Feedback from "./components/Feedback.jsx";
import "./styles/App.css";

function App() {
  const { user, isAuthenticated, loading, logout, refreshUser } = useAuth();
  const [currentView, setCurrentView] = useState('history'); // Default to history page
  const [processingCallback, setProcessingCallback] = useState(false);

  // Handle Cognito callback on component mount
  useEffect(() => {
    const handleCognitoCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Cognito authentication error:', error);
        alert(`Login failed: ${error}`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && !isAuthenticated) {
        setProcessingCallback(true);
        try {
          // Exchange authorization code for tokens
          await exchangeCodeForTokens(code);
          // Set initial view to history as requested
          setCurrentView('history');
          // Clean up URL after successful authentication
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error processing callback:', error);
          alert('Login processing failed. Please try again.');
        } finally {
          setProcessingCallback(false);
        }
      }
    };

    handleCognitoCallback();
  }, [isAuthenticated]);

  // Exchange authorization code for tokens
  const exchangeCodeForTokens = async (authCode) => {
    const cognitoConfig = {
      domain: import.meta.env.VITE_COGNITO_DOMAIN || import.meta.env.REACT_APP_COGNITO_DOMAIN,
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 
                import.meta.env.REACT_APP_COGNITO_CLIENT_ID ||
                import.meta.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || 
                   import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
                   `${window.location.origin}/history`
    };

    try {
      const response = await fetch(`https://${cognitoConfig.domain}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: cognitoConfig.clientId,
          code: authCode,
          redirect_uri: cognitoConfig.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const tokens = await response.json();
      
      // Store tokens using cognitoService
      cognitoService._storeTokens({
        AccessToken: tokens.access_token,
        IdToken: tokens.id_token,
        RefreshToken: tokens.refresh_token,
      });

      // Refresh user in AuthContext
      await refreshUser();
      console.log('User authenticated successfully');
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentView('generate'); // Reset view on sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading state while processing callback or auth is loading
  if (loading || processingCallback) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <p>{processingCallback ? 'Processing login...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Homeschool Activity Generator</h1>
          <div className="user-info">
            <span>Hello, {user.username || user.email || 'User'}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
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
          <button 
            onClick={() => setCurrentView('feedback')}
            className={`nav-btn ${currentView === 'feedback' ? 'active' : ''}`}
          >
            Feedback
          </button>
        </nav>
        
        <main className="app-content">
          {currentView === 'generate' && (
            <GenerateActivityForm />
          )}
          {currentView === 'history' && (
            <HWHistory />
          )}
          {currentView === 'feedback' && (
            <Feedback />
          )}
        </main>
      </div>
    );
  }

  // Show Welcome page when not authenticated
  return <Welcome />;
}

export default App;