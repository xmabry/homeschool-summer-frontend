// App.jsx

import { useState } from "react";
import GenerateActivityForm from "./components/GenerateActivityForm.jsx";
import HWHistory from "./components/HWHistory.jsx";
import Welcome from "./components/Welcome.jsx";
import Feedback from "./components/Feedback.jsx";
import "./styles/App.css";

function App() {
  const [currentView, setCurrentView] = useState('generate'); // 'generate', 'history', or 'feedback'
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start with false to show Welcome page

  if (isAuthenticated) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Homeschool Activity Generator</h1>
          <div className="user-info">
            <span>Hello, User</span>
            <button onClick={() => {
              // Redirect to feedback page before logging out
              setCurrentView('feedback');
              setTimeout(() => {
                setIsAuthenticated(false);
              }, 100); // Small delay to show feedback page first
            }} className="sign-out-btn">
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