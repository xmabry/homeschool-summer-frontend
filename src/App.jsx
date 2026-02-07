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
          // Use cognitoService for token exchange
          await cognitoService.exchangeCodeForTokens(code);
          
          // Mark this code as processed
          sessionStorage.setItem('lastProcessedCode', code);
          
          // Refresh user in AuthContext
          const refreshResult = await refreshUser();
          if (!refreshResult) {
            console.warn('RefreshUser returned false, but continuing...');
          }
          
          console.log('User authenticated successfully');
          
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

  // Login function to be passed to Welcome component
  const handleLogin = () => {
    try {
      // Use cognitoService to build login URL
      const loginUrl = cognitoService.buildLoginUrl();
      console.log('Redirecting to Cognito login URL');
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Error building login URL:', error);
      alert(`Login configuration error: ${error.message}`);
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

  if (!isAuthenticated) {
    return <Welcome onLogin={handleLogin} />;
  }

  return <AuthenticatedApp />;
}

// Component for authenticated routes
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug logging for AuthenticatedApp
  useEffect(() => {
    console.log('AuthenticatedApp: Component mounted/updated', {
      user: !!user,
      currentPath: window.location.pathname
    });
  }, [user]);

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
          <Route path="/" element={<HWHistory />} />
          <Route path="/generate" element={<GenerateActivityForm />} />
          <Route path="/history" element={<HWHistory />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;