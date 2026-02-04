// App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import cognitoService from "./services/cognitoService";
import GenerateActivityForm from "./components/GenerateActivityForm.jsx";
import HWHistory from "./components/HWHistory.jsx";
import Welcome from "./components/Welcome.jsx";
import Feedback from "./components/Feedback.jsx";
import "./styles/App.css";

function App() {
  const { isAuthenticated, loading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [processingCallback, setProcessingCallback] = useState(false);

  // Handle Cognito callback on component mount
  useEffect(() => {
    const handleCognitoCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      console.log('Callback URL params:', {
        url: window.location.href,
        code: code ? code.substring(0, 10) + '...' : null,
        error: error,
        state: state,
        isAuthenticated: isAuthenticated
      });

      if (error) {
        console.error('Cognito authentication error:', error);
        alert(`Login failed: ${error}`);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && !isAuthenticated) {
        console.log('Processing authorization code...');
        
        // Check if we've already processed this code
        const lastProcessedCode = sessionStorage.getItem('lastProcessedCode');
        if (lastProcessedCode === code) {
          console.warn('Authorization code already processed, cleaning up URL...');
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/history', { replace: true });
          return;
        }

        setProcessingCallback(true);
        try {
          // Exchange authorization code for tokens
          await exchangeCodeForTokens(code);
          
          // Mark this code as processed
          sessionStorage.setItem('lastProcessedCode', code);
          
          // Navigate to history page after successful authentication
          navigate('/history', { replace: true });
        } catch (error) {
          console.error('Error processing callback:', error);
          alert(`Login processing failed. Please try again. Error: ${error.message}`);
          // Clean up URL on error
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setProcessingCallback(false);
        }
      } else if (code && isAuthenticated) {
        console.log('User already authenticated, cleaning up URL...');
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/history', { replace: true });
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
      // Must match exactly with the redirectUri used in the authorization request
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || 
                   import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
                   `${window.location.origin}/`
    };

    console.log('Token exchange - Cognito config:', {
      domain: cognitoConfig.domain,
      clientId: cognitoConfig.clientId ? cognitoConfig.clientId.substring(0, 10) + '...' : 'undefined',
      redirectUri: cognitoConfig.redirectUri,
      currentUrl: window.location.href,
      authCode: authCode ? authCode.substring(0, 10) + '...' : 'undefined'
    });

    // Validate required config
    if (!cognitoConfig.domain || !cognitoConfig.clientId) {
      throw new Error(`Missing required Cognito configuration. Domain: ${cognitoConfig.domain}, ClientId: ${cognitoConfig.clientId ? 'present' : 'missing'}`);
    }

    try {
      console.log('Making token exchange request...');
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

      console.log('Token exchange response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed with response:', errorText);
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const tokens = await response.json();
      console.log('Received tokens:', {
        access_token: tokens.access_token ? 'present' : 'missing',
        id_token: tokens.id_token ? 'present' : 'missing', 
        refresh_token: tokens.refresh_token ? 'present' : 'missing'
      });
      
      // Store tokens using cognitoService
      cognitoService._storeTokens({
        AccessToken: tokens.access_token,
        IdToken: tokens.id_token,
        RefreshToken: tokens.refresh_token,
      });

      console.log('Tokens stored, refreshing user...');
      // Refresh user in AuthContext
      const refreshResult = await refreshUser();
      if (!refreshResult) {
        console.warn('RefreshUser returned false, but continuing...');
      }
      console.log('User authenticated successfully');
    } catch (error) {
      console.error('Detailed error in exchangeCodeForTokens:', error);
      throw error;
    }
  };

  // Login function to be passed to Welcome component
  const handleLogin = () => {
    const cognitoConfig = {
      domain: import.meta.env.VITE_COGNITO_DOMAIN || import.meta.env.REACT_APP_COGNITO_DOMAIN,
      clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || 
                import.meta.env.REACT_APP_COGNITO_CLIENT_ID ||
                import.meta.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION || 
              import.meta.env.REACT_APP_AWS_REGION || 
              'us-east-1',
      redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || 
                   import.meta.env.REACT_APP_COGNITO_REDIRECT_URI || 
                   `${window.location.origin}/`
    };

    // Validate required environment variables
    if (!cognitoConfig.domain || !cognitoConfig.clientId) {
      console.error('Missing required Cognito configuration:', {
        domain: cognitoConfig.domain,
        clientId: cognitoConfig.clientId ? 'present' : 'missing'
      });
      return;
    }

    // Build Cognito hosted UI login URL
    const loginUrl = `https://${cognitoConfig.domain}/login?` +
      `client_id=${cognitoConfig.clientId}&` +
      `response_type=code&` +
      `scope=email+openid+phone+profile&` +
      `redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}`;

    console.log('Redirecting to Cognito login URL');
    window.location.href = loginUrl;
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

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <AuthenticatedApp /> : <Welcome onLogin={handleLogin} />} />
      <Route path="/generate" element={isAuthenticated ? <AuthenticatedApp /> : <Welcome onLogin={handleLogin} />} />
      <Route path="/history" element={isAuthenticated ? <AuthenticatedApp /> : <Welcome onLogin={handleLogin} />} />
      <Route path="/feedback" element={isAuthenticated ? <AuthenticatedApp /> : <Welcome onLogin={handleLogin} />} />
    </Routes>
  );
}

// Component for authenticated routes
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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
        <NavLink 
          to="/generate"
          className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
        >
          Generate Activity
        </NavLink>
        <NavLink 
          to="/history"
          className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
        >
          Activity History
        </NavLink>
        <NavLink 
          to="/feedback"
          className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
        >
          Feedback
        </NavLink>
      </nav>
      
      <main className="app-content">
        <Routes>
          <Route path="/generate" element={<GenerateActivityForm />} />
          <Route path="/history" element={<HWHistory />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/" element={<HWHistory />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;