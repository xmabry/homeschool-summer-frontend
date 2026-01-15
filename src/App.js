import './styles/App.css';
import LoginForm from './components/LoginForm.js';
import GenerateActivityForm from './components/GenerateActivityForm.js';
import Header from './components/Logout.js';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HWHistory from './components/HWHistory.js';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <div>
          <Header />
          <GenerateActivityForm />
          <HWHistory />
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;