// App.jsx

import { useState } from "react";
import GenerateActivityForm from "./components/GenerateActivityForm.jsx";
import HWHistory from "./components/HWHistory.jsx";
import "./styles/App.css";

function App() {
  const [currentView, setCurrentView] = useState('generate'); // 'generate' or 'history'
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simplified auth state

  if (isAuthenticated) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Homeschool Activity Generator</h1>
          <div className="user-info">
            <span>Hello, User</span>
            <button onClick={() => setIsAuthenticated(false)} className="sign-out-btn">
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
            <GenerateActivityForm />
          )}
          {currentView === 'history' && (
            <HWHistory />
          )}
        </main>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setIsAuthenticated(true)}>Sign in</button>
    </div>
  );
}

export default App;